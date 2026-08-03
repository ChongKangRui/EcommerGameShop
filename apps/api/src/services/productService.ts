import { Request } from "express";
import { productRepository } from "src/repositories/productRepository";
import { type Logger } from "src/utils/loggerHelper";
import { type ServiceResult } from "@ecom/shared/type/service";
import {
  adminProductSortOptions,
  productFilterOptions,
} from "@ecom/shared/type/product";
import { orderRepository } from "src/repositories/orderRepository";

const withFinalPrice = (product: any, variation: any) => {
  const price = parseFloat(product.price);
  const priceOffset = parseFloat(variation.price_offset);
  const discountPercentage = parseFloat(product.discount_percentage);
  const priceWithOffset = price + priceOffset;
  const final_price =
    priceWithOffset - priceWithOffset * (discountPercentage / 100);
  return { ...variation, final_price };
};

export const productService = {
  async getProduct(
    productId: number,
    userId: string,
    isAdmin: boolean,
    log: Logger,
  ): Promise<
    ServiceResult<{ product: any; variations: any[]; message: string }>
  > {
    log.info(`Fetching product ${productId} from database`);

    // get active product
    const product = await productRepository.getActiveProductById(
      productId,
      !isAdmin,
    );

    // get the product variation
    const variations =
      await productRepository.getProductVariationsByProductId(productId);

    log.info(
      `Product ${productId} query returned product=${!!product}, ${variations.length} variations`,
    );

    if (!product || variations.length === 0) {
      log.warn(`Product ${productId} not found or has no variations`);
      return { ok: false, status: 404, error: "No product found" };
    }
 
    // get the order in case user are already having order and reserve it
   const orderItem = userId
  ? await orderRepository.getCustomerPendingOrderItems(userId)
  : { rows: [] };

    
    // calculate the price of variation with offset
    const pricingCalculatedVariations = variations.map((v) =>
      withFinalPrice(product, v),
    );

    const finalVariations = pricingCalculatedVariations.map((v) => {
      const order = orderItem.rows.find(
    (r) => r.variation_id === v.variation_id,
  );
      
      if (!order) return v;

      return { ...v, stock: v.stock + order.quantity };
    });

    log.info(
      `Product ${productId} found with ${finalVariations.length} variations`,
    );
    return {
      ok: true,
      data: {
        product,
        variations: finalVariations,
        message: "get product Success",
      },
    };
  },

  async getProducts(
    query: Request["query"],
    role: string | undefined,
    log: Logger,
  ) {
    const limit = parseInt(String(query.limit ?? "")) || 5;
    const offset = parseInt(String(query.offset ?? "")) || 0;
    //const [sortColumn, sortDirection] = String(query.sortBy ?? "release_date:desc").split(":");
    const sortBy = String(query.sortBy ?? "release_date:desc");
    const filterBy = String(query.filterBy ?? "all");
    const search = query.search ? String(query.search) : "";
    const showNonActive = query.showNonActive
      ? query.showNonActive === "true"
      : false;

    const isAdmin = role === "admin";
    const includeInactive = isAdmin && showNonActive;

    if (!adminProductSortOptions.some((option) => option.value === sortBy)) {
      throw new Error(`Invalid sort parameter ${sortBy}}`);
    }

    if (!productFilterOptions.some((option) => option === filterBy)) {
      throw new Error(`Invalid sort parameter ${sortBy}}`);
    }

    if (limit > 100) {
      throw new Error(`Limit mote than 100`);
    }

    log.debug("Fetching product list", {
      limit,
      offset,
      sortBy: sortBy,
      filterBy,
      search,
      isAdmin,
      includeInactive,
    });

    const { products, total } = await productRepository.getProductList({
      limit,
      offset,
      sortBy: sortBy,
      filterBy,
      search,
      includeInactive,
    });

    log.info(
      `Query returned ${products.length} products out of ${total} total`,
    );

    return { products, productCount: total, message: "get product Success" };
  },

  async getPromotedProducts(log: Logger) {
    log.info(`Start fetching promoted products`);
    const { products } = await productRepository.getPromotedProductList();

    log.info(`Query returned ${products.length} promoted products`);

    return { products, message: "get product Success" };
  },
};
