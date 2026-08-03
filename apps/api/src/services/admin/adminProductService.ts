import formidable from "formidable";
import cloudinary from "../../gateways/cloudinary";
import { withTransaction } from "../../db/withTransaction";
import { adminProductRepository } from "../../repositories/admin/adminProductRepository";
import { parseProductForm } from "../../utils/productMapper";
import { productServerSchema } from "@ecom/shared/parseFormidableSchema";
import { Logger } from "src/utils/loggerHelper";

import { type ServiceResult } from "@ecom/shared/type/service";

async function cleanupImages(publicIds: string[], Log: Logger) {
  const ids = publicIds.filter(Boolean);
  if (ids.length === 0) return;
  try {
    await cloudinary.api.delete_resources(ids);
    Log.info(`Cleaned up images: ${ids.join(", ")}`);
  } catch (e) {
    Log.error(`Failed to cleanup Cloudinary images`, e);
  }
}

export const adminProductService = {
  async addProduct(
    fields: formidable.Fields,
    files: formidable.Files,
    Log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    const uploadedImages: string[] = [];
    const product = parseProductForm(files, fields);
    const validation = productServerSchema.safeParse(product);

    if (!validation.success) {
      Log.error("Validation failed: ", validation.error);
      return {
        ok: false,
        status: 400,
        error: "Validation failed",
        details: validation.error.issues,
      };
    }

    // extract the variation data
    const {
      name,
      price,
      release_date,
      type,
      discount_percentage,
      push_home_page,
      is_active,
      description,
      variations,
    } = validation.data;

    // upload the image first so later when product row insert
    // cover image url was able to set as well
    // uploaded image id should be collect into an array in case insertion failed
    try {
      const finalVariations = await Promise.all(
        variations.map(async (variation) => {
          if (!variation.image)
            throw new Error(
              `Variation "${variation.label}" is missing an image`,
            );
          const result = await cloudinary.uploader.upload(
            variation.image.filepath,
            { folder: "RedfieldGaming" },
          );
          uploadedImages.push(result.public_id);
          return {
            image_url: result.secure_url,
            image_public_id: result.public_id,
            label: variation.label,
            stock: variation.stock,
            price_offset: variation.price_offset,
            is_cover: variation.is_cover,
          };
        }),
      );

      const cover_image_url =
        finalVariations.find((v) => v.is_cover)?.image_url ??
        finalVariations[0]?.image_url;

      await withTransaction(async (client) => {
        const productId = await adminProductRepository.insertProduct(client, {
          name,
          cover_image_url,
          price,
          type,
          release_date,
          push_home_page,
          is_active,
          discount_percentage,
          description: description ?? "",
        });

        await Promise.all(
          finalVariations.map((v) =>
            adminProductRepository.insertVariation(client, productId, {
              label: v.label,
              imageUrl: v.image_url,
              imagePublicId: v.image_public_id,
              stock: v.stock,
              priceOffset: v.price_offset,
            }),
          ),
        );
      });

      return { ok: true, data: { message: "Add product Success" } };
    } catch (e) {
      await cleanupImages(uploadedImages, Log);
      throw e;
    }
  },

  async updateProduct(
    productId: number,
    fields: formidable.Fields,
    files: formidable.Files,
    Log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    const uploadedImages: string[] = [];
    const imagesToDelete: string[] = [];

    const product = parseProductForm(files, fields);
    const validation = productServerSchema.safeParse(product);
    if (!validation.success) {
      return {
        ok: false,
        status: 400,
        error: "Validation failed",
        details: validation.error.issues,
      };
    }

    // check if product exist
    if (!(await adminProductRepository.productExist(productId))) {
      return { ok: false, status: 404, error: "Product not found" };
    }

    // extract the data
    const {
      name,
      price,
      release_date,
      type,
      push_home_page,
      is_active,
      discount_percentage,
      description,
      variations: newVariations,
    } = validation.data;

    // get product variation by product id
    const existingVariations =
      await adminProductRepository.findVariationsByProductId(productId);

    try {
      // similar logic with addImage, upload the image first
      // return a map with image link
      // collect uploaded images in case rollback happen
      const finalVariations = await Promise.all(
        newVariations.map(async (variation) => {
          if (variation.image) {
            const result = await cloudinary.uploader.upload(
              variation.image.filepath,
              { folder: "RedfieldGaming" },
            );
            uploadedImages.push(result.public_id);
            return {
              ...variation,
              image_url: result.secure_url,
              image_public_id: result.public_id,
            };
          }

          // if no new image, assuming it was an old data.
          // but if old data not found as well, throw an error immedially
          // because it mean that this new variation is not an old data
          // but also dont have a new image for upload
          const oldData = existingVariations.find(
            (old) => old.variation_id === variation.variation_id,
          );
          if (!oldData)
            throw new Error(
              `Variation ${variation.variation_id} not found in DB but has no new image`,
            );
          return {
            ...variation,
            image_url: oldData.image_url,
            image_public_id: oldData.image_public_id,
          };
        }),
      );

      // get the cover image url
      const coverImageUrl =
        finalVariations.find((v) => v.is_cover)?.image_url ??
        finalVariations[0]?.image_url;

      // get all the variations id that should updated into DB
      const incomingIds = new Set(
        finalVariations.map((v) => v.variation_id).filter(Boolean),
      );
      // check which one require remove for variations
      const removedVariations = existingVariations.filter(
        (old) => !incomingIds.has(old.variation_id),
      );

      await withTransaction(async (client) => {
        await adminProductRepository.updateProductRow(client, productId, {
          name,
          cover_image_url: coverImageUrl,
          price,
          type,
          release_date,
          push_home_page,
          is_active,
          discount_percentage,
          description: description ?? "",
        });

        // once row was deleted, push the image to delete into an array
        if (removedVariations.length > 0) {
          await adminProductRepository.deleteVariations(
            client,
            removedVariations.map((v) => v.variation_id),
          );
          removedVariations.forEach(
            (v) => v.image_public_id && imagesToDelete.push(v.image_public_id),
          );
        }

        await Promise.all(
          finalVariations.map((variation) => {
            // if product variation exist
            if (variation.variation_id) {
              const oldData = existingVariations.find(
                (old) => old.variation_id === variation.variation_id,
              );

              // if image link is new, replace the old image with new image
              // push the old image into imagesToDelete array for later deletion
              if (
                oldData &&
                oldData.image_public_id !== variation.image_public_id
              ) {
                imagesToDelete.push(oldData.image_public_id);
              }
              return adminProductRepository.updateVariation(client, {
                variationId: variation.variation_id,
                label: variation.label,
                imageUrl: variation.image_url,
                imagePublicId: variation.image_public_id,
                stock: variation.stock,
                priceOffset: variation.price_offset,
              });
            }

            // otherwise, new variation require a new insertion
            return adminProductRepository.insertVariation(client, productId, {
              label: variation.label,
              imageUrl: variation.image_url,
              imagePublicId: variation.image_public_id,
              stock: variation.stock,
              priceOffset: variation.price_offset,
            });
          }),
        );
      });

      // intentionally not awaited
      //  respond first, clean up old images after
      cleanupImages(imagesToDelete, Log);

      return { ok: true, data: { message: "Update product Success" } };
    } catch (e) {
      await cleanupImages(uploadedImages, Log);
      throw e;
    }
  },

  async deleteProduct(productId: number, Log: Logger) {
    // if have order history, this shouldn't delete and instead, deactivated
    if (await adminProductRepository.hasOrderHistory(productId)) {
      await adminProductRepository.deactivateProduct(productId);
      return {
        message: "Product has order history — deactivated instead of deleted",
      };
    }

    const variations =
      await adminProductRepository.findVariationsByProductIdOrdered(productId);
    await adminProductRepository.deleteProduct(productId);

    if (variations.length > 0) {
      await adminProductRepository.deleteCartByVariationIds(
        variations.map((v) => v.variation_id),
      );
      await cleanupImages(
        variations.map((v) => v.image_public_id),
        Log,
      );
    }

    return { message: "Product delete success" };
  },

  // bulk delete products
  async deleteProducts(productIds: number[], Log: Logger) {
    // same thing with delete product, protect the product deletion
    // in case it have order history
    const results = await Promise.all(
      productIds.map(async (id) => ({
        id,
        hasOrderHistory: await adminProductRepository.hasOrderHistory(id),
      })),
    );

    // filter out the orderHistory
    const finalProductIds = results
      .filter((r) => !r.hasOrderHistory)
      .map((r) => r.id);

    // doing bulk delete
    await adminProductRepository.bulkDeleteProduct(finalProductIds);

    const variations =
      await adminProductRepository.findVariationsByProductIds(finalProductIds);

    await cleanupImages(
      variations.map((v) => v.image_public_id),
      Log,
    );
    return { message: finalProductIds.length === productIds.length ? 
      "Products delete success" : `Deleted ${finalProductIds.length} of ${productIds.length} product(s). ` +
        `Skipped ${productIds.length - finalProductIds.length} due to existing order history. You may try to deactivate it instead.` };
  },

  async discountProducts(productIds: number[], discountPercentage: number) {
    await adminProductRepository.bulkUpdateDiscount(
      productIds,
      discountPercentage,
    );
    return { message: "Products discount success" };
  },

  async promoteProducts(productIds: number[], promote: boolean) {
    await adminProductRepository.bulkUpdatePromote(productIds, promote);
    return { message: "Products promote state update success" };
  },

  async activeProducts(productIds: number[], active: boolean) {
    await adminProductRepository.bulkUpdateActive(productIds, active);
    return { message: "Products active state update success" };
  },
  async getActiveProductCount(log: Logger): Promise<number> {
    log.info(`Start getting active product count`);
    const count = await adminProductRepository.getActiveProductCount();

    log.info(`Query returned active product count = ${count} `);

    return count;
  },
};
