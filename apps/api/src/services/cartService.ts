import { cartItemSchema, cartItemsSchema } from "@ecom/shared/cartDataSchema";
import { cartRepository } from "src/repositories/cartRepository";
import { type Logger } from "src/utils/loggerHelper";
import { type ServiceResult } from "@ecom/shared/type/service";
import { orderRepository } from "src/repositories/orderRepository";

export const cartService = {
  async getGuestCartProduct(body: unknown, log: Logger): Promise<ServiceResult<{ cartItems: any[]; adjusted: boolean }>> {
    const validationResult = cartItemsSchema.safeParse(body);
    const cartItems = validationResult.data?.cartItems;
    
    if (!cartItems || cartItems.length <= 0) {
      log.warn("No cart items provided or empty cart");
      return { ok: false, status: 400, error: "Invalid action" };
    }

    const variationIds = cartItems.map((item) => item.variation_id);
    const rows = await cartRepository.findVariationsForGuestCart(variationIds);

    let adjusted = false;
    const outCartItems = rows.map((item) => {
      const quantity = cartItems.find((c) => c.variation_id === item.variation_id)?.quantity;
      if (!quantity) {
        throw new Error(`Missing quantity for variation ${item.variation_id}`);
      }
      const finalQuantity = Math.min(quantity, item.stock);
      if (finalQuantity !== quantity) {
        adjusted = true;
        log.debug(`Adjusted quantity for variation ${item.variation_id}: ${quantity} -> ${finalQuantity}`);
      }
      return { ...item, quantity: finalQuantity };
    });

    log.info(`Guest cart processed: ${outCartItems.length} items, adjusted=${adjusted}`);
    return { ok: true, data: { cartItems: outCartItems, adjusted } };
  },

  async migrateCartItems(userId: string, body: unknown, log: Logger) {
    const validationResult = cartItemsSchema.safeParse(body);
    let adjusted = false;

    if (validationResult.success) {
      const { cartItems } = validationResult.data;
      const variationIds = cartItems.map((c) => c.variation_id);
      const stockRows = await cartRepository.findStockByVariationIds(variationIds);
      const stockMap = new Map(stockRows.map((r) => [r.variation_id, r.stock]));

      await Promise.all(
        cartItems.map((c) => {
          const available = stockMap.get(c.variation_id) ?? 0;
          const cappedQuantity = Math.min(c.quantity, available);

          if (cappedQuantity !== c.quantity) {
            adjusted = true;
            log.debug(`Adjusted quantity for variation ${c.variation_id}: ${c.quantity} -> ${cappedQuantity}`);
          }

          if (cappedQuantity > 0) {
            return cartRepository.insertCartItem(userId, c.variation_id, cappedQuantity);
          }
          log.debug(`Skipping variation ${c.variation_id} - quantity capped to 0`);
        }),
      );

      log.info(`Cart migration completed for user ${userId}, adjusted=${adjusted}`);
    } else {
      log.warn("Validation failed for cart items migration", {Error: validationResult.error});
    }

    const cartItems = await cartRepository.findCartItemsForUser(userId);
    log.info(`Returning ${cartItems.length} migrated cart items for user ${userId}`);

    return { cartItems, adjusted };
  },

  async getCartItem(userId: string, log: Logger) {
    const cartItemRows = await cartRepository.findCartItemsForUser(userId);
   
    let adjusted = false;
    const pendingUpdates: Promise<void>[] = [];

    const outCartItems = cartItemRows
      .map((item) => {
        let maxAllowed = item.stock;
        let finalQuantity = item.quantity;  
        
      
        if (maxAllowed <= 0 || !item.is_active) {
          adjusted = true;
          log.debug(`Removing variation ${item.variation_id} - out of stock or inactive`);
          pendingUpdates.push(cartRepository.deleteCartItem(userId, item.variation_id));
          return null;
        }

        if (item.quantity > maxAllowed) {
          adjusted = true;
          finalQuantity = maxAllowed;
          log.debug(`Adjusted quantity for variation ${item.variation_id}: ${item.quantity} -> ${finalQuantity}`);
          pendingUpdates.push(cartRepository.updateCartItemQuantity(userId, item.variation_id, finalQuantity));
        }

        const final_price = Number(item.final_price).toFixed(2);
        return { ...item, stock: maxAllowed, quantity: finalQuantity, final_price };
      })
      .filter(Boolean);

    await Promise.all(pendingUpdates);

    log.info(`Cart items processed for user ${userId}: ${outCartItems.length} items, adjusted=${adjusted}`);
    return { cartItems: outCartItems, adjusted };
  },

  async addCartItem(userId: string, body: unknown, log: Logger): Promise<ServiceResult<{ cartItems: any[]; message: string }>> {
    const validationResult = cartItemSchema.safeParse(body);
    if (!validationResult.success) {
      log.warn("Invalid cart item data", {Error: validationResult.error});
      return { ok: false, status: 400, error: "Invalid data" };
    }

    const { variation_id, quantity } = validationResult.data;
  //  const stockRow = await cartRepository.findStockForVariation(variation_id);
    
 const stockRow = await cartRepository.findAvailableStock(variation_id, userId);
    if (!stockRow) {
      log.warn(`Variation ${variation_id} not found`);
      return { ok: false, status: 404, error: "Product not found" };
    }
    // here having problem where if only one stock unable to add into cart even cart only have 2
   
   
    const { stock } = stockRow;
    if (stock < quantity) {
      log.warn(`Insufficient stock for variation ${variation_id}: requested ${quantity}, available ${stock}`);
      return { ok: false, status: 400, error: stock === 0 ? "Out of stock" : `Only ${stock} available` };
    }

    await cartRepository.insertCartItem(userId, variation_id, quantity);
    const cartItems = await cartRepository.findCartItemsForUser(userId);

    log.info(`Cart item added for user ${userId}`);
    return { ok: true, data: { cartItems, message: "Add cart product Success" } };
  },

  async updateCartItem(userId: string, body: unknown, log: Logger): Promise<ServiceResult<{ cartItems: any[]; message: string }>> {
    const validationResult = cartItemSchema.safeParse(body);
    
    if (!validationResult.success) {
      log.warn("Invalid cart item data for update", {Error: validationResult.error});
      return { ok: false, status: 400, error: "Invalid data" };
    }

    const { variation_id, quantity } = validationResult.data;
    const stockRow = await cartRepository.findAvailableStock(variation_id, userId);
    
    // const orderItemRows = await orderRepository.getCustomerPendingOrderItems(userId);
    //const reservedItem = orderItemRows.rows.filter((r)=>r.variation_id === variation_id);
        

    if (!stockRow) {
      log.warn(`Variation ${variation_id} not found for update`);
      return { ok: false, status: 404, error: "Product not found" };
    }

    const { stock } = stockRow;
    if (stock < quantity) {
      log.warn(`Insufficient stock for variation ${variation_id}: requested ${quantity}, available ${stock}`);
      return { ok: false, status: 400, error: stock === 0 ? "Out of stock" : `Only ${stock} available` };
    }

    await cartRepository.updateCartItemQuantity(userId, variation_id, quantity);
    const cartItems = await cartRepository.findCartItemsForUser(userId);

    log.info(`Cart item updated for user ${userId}`);
    return { ok: true, data: { cartItems, message: "Update cart product Success" } };
  },

  async deleteCartItem(userId: string, variationId: string, log: Logger) {
    await cartRepository.deleteCartItem(userId, variationId);
    const cartItems = await cartRepository.findCartItemsForUser(userId);

    log.info(`Cart item deleted for user ${userId}`, { variationId, remainingItems: cartItems.length });
    return { cartItems, message: "Delete product success" };
  },

  async validateCart(userId: string, log: Logger) {
    const cartRows = await cartRepository.findCartValidationItems(userId);
    const orderItemRows = await orderRepository.getCustomerPendingOrderItems(userId);

    const badProduct = cartRows.some((ci) =>
      {
      const orderItem = orderItemRows.rows.filter((oi)=>oi.variation_id === ci.variation_id);
       return ci.quantity - (orderItem.length > 0 ? orderItem[0].quantity : 0) > ci.stock
      }) || cartRows.length <= 0;

    if (badProduct) {
      log.warn(`Cart validation failed for user ${userId} - items exceed stock or cart empty`);
    } else {
      log.info(`Cart validation passed for user ${userId}`);
    }

    return {
      validationPass: !badProduct,
      message: badProduct ? "Some items were adjusted due to stock changes" : "",
    };
  },
};