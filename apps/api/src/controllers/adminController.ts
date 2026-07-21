import type { Request, Response, NextFunction } from "express";
import formidable from "formidable";
import cloudinary from "../gateways/cloudinary";
import { pool } from "../db/db";
import {
  productVariationServerSchema,
  productSchema,
} from "@ecom/shared/src/parseFormidableSchema";
import { generateLogId, logger } from "src/utils/loggerHelper";
import {
  AdminOrderTypeEnum,
  adminOrderTypeOptions,
  getOrderStatusAvailableUpdateOptions,
  Order,
  orderAdminFilterOptions,
  OrderItem,
  OrderWithCustomer,
} from "@ecom/shared/src/type/order";

const parseVariations = (fields: formidable.Fields) => {
  logger.debug("Parsing variations from form fields");
  const variations: Record<string, string>[] = [];

  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(/^variations\[(\d+)\]\[(\w+)\]$/);
    if (!match) continue;

    const index = parseInt(match[1]);
    const field = match[2];

    if (!variations[index]) variations[index] = {};
    variations[index][field] = value?.[0] ?? "";
  }

  logger.debug(`Parsed ${variations.length} variations`);
  return variations;
};

const parseProduct = (files: formidable.Files, fields: formidable.Fields) => {
  logger.info("Parsing product data from request");

  const parsedVariations = parseVariations(fields);

  const name = fields.name?.[0];
  const price = parseFloat(fields.price?.[0] ?? "0");
  const type = fields.type?.[0];
  const push_home_page = fields.push_home_page?.[0] === "true" ? true : false;
  const release_date = fields.release_date?.[0];
  console.log(fields);
  const description = fields.description?.[0];
  const discount_percentage = parseFloat(
    fields.discount_percentage?.[0] ?? "0",
  );

  const variations = [];

  for (const [index, variation] of parsedVariations.entries()) {
    const label = variation.label;
    const variation_id = variation.variation_id;
    const is_cover = variation.is_cover === "true";
    const stock = parseInt(variation.stock);
    const price_offset = parseFloat(variation.price_offset);

    const image = files[`variations[${index}]`]?.at(0);
    const image_url = variation.image_url;

    variations.push({
      label,
      variation_id,
      image,
      image_url,
      is_cover,
      stock,
      price_offset,
    });
  }

  logger.info(`Parsed product: ${name} with ${variations.length} variations`);

  return {
    name,
    price,
    type,
    release_date,
    push_home_page,
    discount_percentage,
    description,
    variations,
  };
};

export const addProduct = async (req: Request, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Add product request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const uploadedImages: string[] = [];
  const client = await pool.connect();

  try {
    logger.debug(`[${requestId}] Connected to database`);
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);

    const product = parseProduct(files, fields);

    // validation first
    const validationResult = productSchema.safeParse(product);

    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      logger.warn(`[${requestId}] Product validation failed`, {
        errors: errors.map((e) => ({ path: e.path, message: e.message })),
      });
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    logger.info(`[${requestId}] Product validation successful`);

    const {
      name,
      price,
      release_date,
      type,
      discount_percentage,
      push_home_page,
      variations,
    } = validationResult.data;

    //after validation, lets start uploading images first
    logger.info(
      `[${requestId}] Starting upload of ${variations.length} variation images to Cloudinary`,
    );

    const finalVariationResults = await Promise.all(
      variations.map(async (variation) => {
        if (variation.image) {
          logger.debug(
            `[${requestId}] Uploading image for variation: ${variation.label}`,
          );
          const result = await cloudinary.uploader.upload(
            variation.image.filepath,
            {
              folder: "RedfieldGaming",
            },
          );
          uploadedImages.push(result.public_id);
          logger.debug(`[${requestId}] Image uploaded: ${result.public_id}`);

          return {
            image_url: result.secure_url,
            image_public_id: result.public_id,
            label: variation.label,
            stock: variation.stock,
            price_offset: variation.price_offset,
            is_cover: variation.is_cover,
          };
        }
        logger.error(
          `[${requestId}] Variation "${variation.label}" is missing an image`,
        );
        throw new Error(`Variation "${variation.label}" is missing an image`);
      }),
    );

    logger.info(
      `[${requestId}] All ${finalVariationResults.length} images uploaded successfully`,
    );

    const coverImageVariation = finalVariationResults.find((v) => v.is_cover);
    const coverImageUrl =
      coverImageVariation?.image_url || finalVariationResults[0]?.image_url;

    logger.debug(`[${requestId}] Cover image URL: ${coverImageUrl}`);

    await client.query("BEGIN");
    logger.debug(`[${requestId}] Database transaction started`);

    const productInsertResult = await client.query(
      `INSERT INTO products (name, cover_image_url, price, type, release_date, push_home_page , discount_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING product_id`,
      [
        name,
        coverImageUrl,
        price,
        type,
        release_date,
        push_home_page,
        discount_percentage,
      ],
    );

    const productId = productInsertResult.rows[0].product_id;
    logger.info(`[${requestId}] Product created with ID: ${productId}`);

    await Promise.all(
      finalVariationResults.map(
        async (variation) =>
          await client.query(
            `INSERT INTO product_variations (product_id, label, image_url, image_public_Id, stock, price_offset)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              productId,
              variation.label,
              variation.image_url,
              variation.image_public_id,
              variation.stock,
              variation.price_offset,
            ],
          ),
      ),
    );

    logger.info(
      `[${requestId}] ${finalVariationResults.length} variations inserted for product ${productId}`,
    );

    await client.query("COMMIT");
    logger.info(`[${requestId}] Transaction committed successfully`);

    res.status(200).json({ message: "Add product Success" });
    logger.info(`[${requestId}] Add product request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in add product`, e);

    await client.query("ROLLBACK");
    logger.warn(`[${requestId}] Database transaction rolled back`);

    //clean up image if any error happen
    if (uploadedImages.length > 0) {
      logger.info(
        `[${requestId}] Cleaning up ${uploadedImages.length} uploaded images from Cloudinary`,
      );
      try {
        await cloudinary.api.delete_resources(uploadedImages);
        logger.info(`[${requestId}] Cleaned up images:`, uploadedImages);
      } catch (cloudErr) {
        logger.error(
          `[${requestId}] Failed to cleanup Cloudinary images`,
          cloudErr,
        );
      }
    }

    res.status(500).json({ error: "Invalid action" });
  } finally {
    client.release();
    logger.debug(`[${requestId}] Database connection released`);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { id } = req.params;
  const product_id = parseInt(id as string);
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Update product request received for product ID: ${product_id}`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  );

  const uploadedImages: string[] = [];
  const imagesToDelete: string[] = [];
  const client = await pool.connect();

  try {
    logger.debug(`[${requestId}] Connected to database`);
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);

    const product = parseProduct(files, fields);

    const validationResult = productSchema.safeParse(product);

    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      logger.warn(`[${requestId}] Product validation failed for update`, {
        productId: product_id,
        errors: errors.map((e) => ({ path: e.path, message: e.message })),
      });
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    logger.info(`[${requestId}] Product validation successful for update`);

    const {
      name,
      price,
      release_date,
      type,
      push_home_page,
      discount_percentage,
      description,
      variations: newVariations,
    } = validationResult.data;

    // Check product exists
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1",
      [product_id],
    );
    if (productCheck.rows.length === 0) {
      logger.warn(`[${requestId}] Product not found for update: ${product_id}`);
      return res.status(404).json({ error: "Product not found" });
    }

    logger.debug(
      `[${requestId}] Product ${product_id} exists, proceeding with update`,
    );

    // Fetch existing variations
    const existingVariations = (
      await pool.query(
        "SELECT * FROM product_variations WHERE product_id = $1",
        [product_id],
      )
    ).rows;

    logger.debug(
      `[${requestId}] Found ${existingVariations.length} existing variations for product ${product_id}`,
    );

    // Upload new images first
    logger.info(
      `[${requestId}] Processing ${newVariations.length} variations for upload/update`,
    );

    const finalVariations = await Promise.all(
      newVariations.map(async (variation) => {
        if (variation.image) {
          logger.debug(
            `[${requestId}] Uploading new image for variation: ${variation.label}`,
          );
          const result = await cloudinary.uploader.upload(
            variation.image.filepath,
            {
              folder: "RedfieldGaming",
            },
          );
          uploadedImages.push(result.public_id);
          logger.debug(
            `[${requestId}] New image uploaded: ${result.public_id}`,
          );

          return {
            ...variation,
            image_url: result.secure_url,
            image_public_id: result.public_id,
          };
        }

        // No new image — get existing image data from DB
        const oldData = existingVariations.find(
          (old) => old.variation_id === variation.variation_id,
        );
        if (!oldData) {
          logger.error(
            `[${requestId}] Variation ${variation.variation_id} not found in DB but has no new image`,
          );
          throw new Error(
            `Variation ${variation.variation_id} not found in DB but has no new image`,
          );
        }
        logger.debug(
          `[${requestId}] Keeping existing image for variation: ${variation.label}`,
        );
        return {
          ...variation,
          image_url: oldData.image_url,
          image_public_id: oldData.image_public_id,
        };
      }),
    );

    // determine cover image and get the url
    const coverVariation = finalVariations.find((v) => v.is_cover);
    const coverImageUrl =
      coverVariation?.image_url ?? finalVariations[0]?.image_url;

    logger.debug(`[${requestId}] Cover image URL for update: ${coverImageUrl}`);

    // Determine which existing variations were removed
    const incomingVariationIds = new Set(
      finalVariations.map((v) => v.variation_id).filter(Boolean),
    );

    const removedVariations = existingVariations.filter(
      (old) => !incomingVariationIds.has(old.variation_id),
    );

    if (removedVariations.length > 0) {
      logger.info(
        `[${requestId}] ${removedVariations.length} variations will be removed`,
        {
          removedIds: removedVariations.map((v) => v.variation_id),
        },
      );
    }

    // DB transaction start
    await client.query("BEGIN");
    logger.debug(`[${requestId}] Database transaction started for update`);

    // Update product
    await client.query(
      `UPDATE products
       SET name=$1, cover_image_url=$2, price=$3, type=$4,
           release_date=$5, push_home_page=$6, discount_percentage=$7, description=$8, updated_at=NOW()
       WHERE product_id=$9`,
      [
        name,
        coverImageUrl,
        price,
        type,
        release_date,
        push_home_page,
        discount_percentage,
        description,
        product_id,
      ],
    );

    logger.debug(`[${requestId}] Product ${product_id} updated in database`);

    // Delete removed variations from DB
    if (removedVariations.length > 0) {
      await client.query(
        "DELETE FROM product_variations WHERE variation_id = ANY($1)",
        [removedVariations.map((v) => v.variation_id)],
      );
      removedVariations.forEach((v) => {
        if (v.image_public_id) imagesToDelete.push(v.image_public_id);
      });
      logger.debug(
        `[${requestId}] Removed ${removedVariations.length} variations from database`,
      );
    }

    // Update existing / insert new variations
    let updateCount = 0;
    let insertCount = 0;

    await Promise.all(
      finalVariations.map(async (variation) => {
        if (variation.variation_id) {
          // Check if image changed — queue old image for deletion
          const oldData = existingVariations.find(
            (old) => old.variation_id === variation.variation_id,
          );
          if (
            oldData &&
            oldData.image_public_id !== variation.image_public_id
          ) {
            imagesToDelete.push(oldData.image_public_id);
            logger.debug(
              `[${requestId}] Variation ${variation.variation_id} image will be replaced`,
            );
          }

          updateCount++;
          return client.query(
            `UPDATE product_variations
             SET label=$1, image_url=$2, image_public_id=$3,
                 stock=$4, price_offset=$5, updated_at=NOW()
             WHERE variation_id=$6`,
            [
              variation.label,
              variation.image_url,
              variation.image_public_id,
              variation.stock,
              variation.price_offset,
              variation.variation_id,
            ],
          );
        }

        // No variation_id — it's a new variation, insert it
        insertCount++;
        return client.query(
          `INSERT INTO product_variations
           (product_id, label, image_url, image_public_id, stock, price_offset)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            product_id,
            variation.label,
            variation.image_url,
            variation.image_public_id,
            variation.stock,
            variation.price_offset,
          ],
        );
      }),
    );

    logger.info(
      `[${requestId}] Updated ${updateCount} variations, inserted ${insertCount} new variations`,
    );

    await client.query("COMMIT");
    logger.info(
      `[${requestId}] Update transaction committed successfully for product ${product_id}`,
    );

    // Send response, then clean up old Cloudinary images after
    res.status(200).json({ message: "Update product Success" });
    logger.info(`[${requestId}] Update product request completed successfully`);

    if (imagesToDelete.length > 0) {
      logger.info(
        `[${requestId}] Cleaning up ${imagesToDelete.length} old images from Cloudinary`,
      );
      try {
        await Promise.all(
          imagesToDelete.filter(Boolean).map(async (id) => {
            logger.debug(`[${requestId}] Deleting Cloudinary image: ${id}`);
            return cloudinary.uploader.destroy(id);
          }),
        );
        logger.info(
          `[${requestId}] Successfully cleaned up ${imagesToDelete.length} old images`,
        );
      } catch (cloudErr) {
        logger.error(
          `[${requestId}] Cloudinary cleanup failed for old images`,
          cloudErr,
        );
      }
    }
  } catch (e) {
    logger.error(
      `[${requestId}] Error in update product for ID ${product_id}`,
      e,
    );

    await client.query("ROLLBACK");
    logger.warn(`[${requestId}] Update transaction rolled back`);

    // Clean up any newly uploaded images if something failed
    if (uploadedImages.length > 0) {
      logger.info(
        `[${requestId}] Cleaning up ${uploadedImages.length} newly uploaded images after error`,
      );
      try {
        await cloudinary.api.delete_resources(uploadedImages);
        logger.info(
          `[${requestId}] Cleaned up uploaded images after error:`,
          uploadedImages,
        );
      } catch (cloudErr) {
        logger.error(
          `[${requestId}] Cloudinary error cleanup failed`,
          cloudErr,
        );
      }
    }

    res.status(500).json({ error: "Update failed" });
  } finally {
    client.release();
    logger.debug(`[${requestId}] Database connection released`);
  }
};

// single product deletion
export const deleteProduct = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { id } = req.params;
  const product_id = parseInt(String(id));
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Delete product request received for product ID: ${product_id}`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  );

  try {
    // Check if this product has ever been ordered
    const orderCheck = await pool.query(
      "SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1",
      [product_id],
    );

    if (orderCheck.rows.length > 0) {
      // Has order history — can't hard delete (FK RESTRICT), so deactivate instead
      await pool.query(
        "UPDATE products SET is_active = false WHERE product_id = $1",
        [product_id],
      );
      logger.info(
        `[${requestId}] Product ${product_id} has order history — deactivated instead of deleted`,
      );

      res.status(200).json({
        message: "Product has order history — deactivated instead of deleted",
      });
      logger.info(
        `[${requestId}] Delete product request completed successfully (soft delete)`,
      );
      return;
    }

    // No order history — safe to hard delete
    const variationsResult = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [product_id],
    );

    logger.debug(
      `[${requestId}] Found ${variationsResult.rows.length} variations for product ${product_id}`,
    );

    await pool.query("DELETE FROM products WHERE product_id = $1", [
      product_id,
    ]);
    logger.info(`[${requestId}] Product ${product_id} deleted from database`);

    if (variationsResult.rows.length > 0) {
      await pool.query(
        "DELETE FROM cart WHERE variation_id = ANY($1)",
        [variationsResult.rows.map((v) => v.variation_id)],
      );
      logger.info(
        `[${requestId}] Cart entries deleted for ${variationsResult.rows.length} variations`,
      );

      logger.info(
        `[${requestId}] Cleaning up ${variationsResult.rows.length} images from Cloudinary`,
      );
      try {
        await Promise.all(
          variationsResult.rows.map(async (data) => {
            logger.debug(
              `[${requestId}] Deleting Cloudinary image: ${data.image_public_id}`,
            );
            return cloudinary.uploader.destroy(data.image_public_id);
          }),
        );
        logger.info(
          `[${requestId}] Successfully cleaned up ${variationsResult.rows.length} images`,
        );
      } catch (cloudErr) {
        logger.error(`[${requestId}] Cloudinary cleanup failed`, cloudErr);
      }
    }

    res.status(200).json({ message: "Product delete success" });
    logger.info(`[${requestId}] Delete product request completed successfully`);
  } catch (e) {
    logger.error(
      `[${requestId}] Error in delete product for ID ${product_id}`,
      e,
    );
    res.status(500).json({ error: "Delete failed" });
  }
};

// Multiple product deletion
export const deleteProducts = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const productIds = req.body;
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Bulk delete request received for ${Array.isArray(productIds) ? productIds.length : 0} products`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      productIds: productIds,
    },
  );

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      logger.warn(
        `[${requestId}] Invalid bulk delete request - no product IDs provided`,
      );
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    const variationsResult = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = any($1) ORDER BY created_at ASC",
      [productIds],
    );

    console.log(variationsResult.rows);
    logger.info(
      `[${requestId}] Found ${variationsResult.rows.length} variations across ${productIds.length} products`,
    );

    await pool.query("DELETE FROM products WHERE product_id = any($1)", [
      productIds,
    ]);

    logger.info(
      `[${requestId}] ${productIds.length} products deleted from database`,
    );

    // Then clean up images — don't block the response
    if (variationsResult.rows.length > 0) {
      logger.info(
        `[${requestId}] Cleaning up ${variationsResult.rows.length} images from Cloudinary`,
      );
      try {
        await Promise.all(
          variationsResult.rows.map(async (data) => {
            logger.debug(
              `[${requestId}] Deleting Cloudinary image: ${data.image_public_id}`,
            );
            return cloudinary.uploader.destroy(data.image_public_id);
          }),
        );
        logger.info(
          `[${requestId}] Successfully cleaned up ${variationsResult.rows.length} images`,
        );
      } catch (cloudErr) {
        logger.error(
          `[${requestId}] Cloudinary cleanup failed for bulk delete`,
          cloudErr,
        );
      }
    }

    res.status(200).json({ message: "Products delete success" });
    logger.info(`[${requestId}] Bulk delete request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in bulk delete`, e);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const discountProducts = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { productIds, discountPercentage } = req.body.data;
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Bulk discount product request received for ${Array.isArray(productIds) ? productIds.length : 0} products`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      data: req.body.data,
    },
  );

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      logger.warn(
        `[${requestId}] Invalid bulk discount request - no product IDs provided`,
      );
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    logger.info(`[${requestId}] Bulk discount update begin`);
    await pool.query(
      `UPDATE products Set discount_percentage = $1 WHERE product_id = any($2)`,
      [discountPercentage, productIds],
    );

    res.status(200).json({ message: "Products discount success" });
    logger.info(`[${requestId}] Bulk discount request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in discount state update`, e);
    res.status(500).json({ error: "discount state update failed" });
  }
};

export const promoteProducts = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { productIds, promote } = req.body.data;
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Bulk promote product request received for ${Array.isArray(productIds) ? productIds.length : 0} products`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      data: req.body.data,
    },
  );

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      logger.warn(
        `[${requestId}] Invalid bulk promote request - no product IDs provided`,
      );
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    logger.info(`[${requestId}] Bulk promote update begin`);
    await pool.query(
      `UPDATE products Set push_home_page = $1 WHERE product_id = any($2)`,
      [promote, productIds],
    );

    res.status(200).json({ message: "Products promote state update success" });
    logger.info(`[${requestId}] Bulk promote request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in bulk promote`, e);
    res.status(500).json({ error: "Set promote state failed" });
  }
};

export const activeProducts = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { productIds, active } = req.body.data;
  logger.info(`-------------------------------------------------------`);
  logger.info(
    `[${requestId}] Bulk active product request received for ${Array.isArray(productIds) ? productIds.length : 0} products`,
    {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      data: req.body.data,
    },
  );

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      logger.warn(
        `[${requestId}] Invalid bulk active request - no product IDs provided`,
      );
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    logger.info(`[${requestId}] Bulk active update begin`);
    await pool.query(
      `UPDATE products Set is_active = $1 WHERE product_id = any($2)`,
      [active, productIds],
    );

    res.status(200).json({ message: "Products active state update success" });
    logger.info(`[${requestId}] Bulk active state request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in bulk active`, e);
    res.status(500).json({ error: "Set active state failed" });
  }
};

//////////////////////////////////////////
// Get list of order
//////////////////////////////////////////
export const getAllOrders = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get products request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    query: req.query,
  });

  try {
    const limit = parseInt(String(req.query.limit ?? "")) || 5;
    const offset = parseInt(String(req.query.offset ?? "")) || 0;
    const sortParam = String(req.query.sortBy ?? "created_at:desc");
    const [sortColumn, sortDirection] = sortParam.split(":");
    const filterParam = String(req.query.filterBy ?? "all");
    const search = req.query.search ? String(req.query.search) : null;

    // EXACTLY the same as original - just added a log before the logic
    logger.debug(
      `[${requestId}] Query params: limit=${limit}, offset=${offset}, sort=${sortParam}, filter=${filterParam}, search=${search}`,
    );

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      console.log(search); // KEPT THE ORIGINAL CONSOLE.LOG
      conditions.push(`name ILIKE $${paramIndex}`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (filterParam !== "all") {
      conditions.push(`status = $${paramIndex}`);
      values.push(`${filterParam}`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [orderResults, countResult] = await Promise.all([
      pool.query<Order>(
        `SELECT o.order_id, o.status, o.total_amount, o.expires_at, o.updated_at, o.created_at, 
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name,
         u.email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
      ${whereClause}
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM orders ${whereClause}`, values),
    ]);

    logger.info(
      `[${requestId}] Query returned orders of ${parseInt(countResult.rows[0].count)} total`,
    );

    res.status(200).json({
      orders: orderResults.rows,
      orderCount: parseInt(countResult.rows[0].count),
      message: "get product Success",
    });

    logger.info(`[${requestId}] Get orders request completed successfully`);
  } catch (e) {
    logger.error(`[${requestId}] Error in get orders`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

//////////////////////////////////////////
// Get single order
//////////////////////////////////////////
export const getOrder = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get order request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    query: req.query,
  });

  try {
    const { orderId } = req.params;

    const [customerInfo, orderSummary] = await Promise.all([
      pool.query<OrderWithCustomer>(
        `SELECT o.*,
u.email, u.address,
CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name FROM public.orders o
Left join users u on o.user_id = u.user_id
where o.order_id = $1`,
        [orderId],
      ),
      pool.query<OrderItem>(
        `SELECT p.name,oi.order_item_id,oi.quantity, 
oi.price as item_total_price, pv.label, 
pv.image_url FROM order_items oi
Left join product_variations pv on oi.variation_id = pv.variation_id
Left join products p on pv.product_id = p.product_id
where oi.order_id = $1
ORDER BY order_item_id ASC `,
        [orderId],
      ),
    ]);

    logger.info(
      `[${requestId}] Query returned order of ${customerInfo.rows.length} total`,
    );

    logger.info(
      `[${requestId}] Query returned order of ${orderSummary.rows.length} total`,
    );

    logger.info(`[${requestId}] Get order request completed successfully`);

    res.status(200).json({
      orderCustomerInfo: customerInfo.rows[0],
      orderItems: orderSummary.rows,

      message: "get order Success",
    });
  } catch (e) {
    logger.error(`[${requestId}] Error in get orders`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get order update request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    query: req.query,
  });

  try {
    const { orderId } = req.params;
    const { newStatus } = req.body.data;

    const validatedStatus = adminOrderTypeOptions.safeParse(
      newStatus as AdminOrderTypeEnum,
    );

    if (!validatedStatus.success) {
      logger.error(`[${requestId}] Unsuccessful validation status`);
      return res.status(400).json({ error: "Invalid order status" });
    }

    const result = await pool.query(
      `select o.status from orders o where o.order_id = $1 `,
      [orderId],
    );
    if (result.rows.length === 0) {
      logger.error(`[${requestId}] Invalid order from sql query`);
      return res.status(400).json({ error: "Invalid order confirmation" });
    }

    const allowedStatus = getOrderStatusAvailableUpdateOptions(
      result.rows[0].status as AdminOrderTypeEnum,
    );

    if (!allowedStatus?.some((s) => s === validatedStatus.data)) {
      logger.error(`[${requestId}] Unavailable order status update`);
      return res
        .status(400)
        .json({ error: "Invalid order status update action" });
    }

    await pool.query<OrderWithCustomer>(
      `UPDATE orders
       SET status = $1
        where order_id = $2`,
      [newStatus, orderId],
    );

    logger.info(`[${requestId}] Update order status successfully`);

    res.status(200).json({
      message: "Update order status success",
    });
  } catch (e) {
    logger.error(`[${requestId}] Error in get orders`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateOrdersStatus = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get order update request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    query: req.query,
  });

  try {
    const { orderIds, newStatus } = req.body.data;

    const validatedStatus = adminOrderTypeOptions.safeParse(
      newStatus as AdminOrderTypeEnum,
    );

    if (!validatedStatus.success) {
      logger.error(`[${requestId}] Unsuccessful validation status`);
      return res.status(400).json({ error: "Invalid order status" });
    }

    const checkingResult = await pool.query(
      `select o.status, o.order_id from orders o where o.order_id = any($1) `,
      [orderIds],
    );
    if (checkingResult.rows.length === 0) {
      logger.error(`[${requestId}] Invalid order from sql query`);
      return res.status(400).json({ error: "Invalid orders" });
    }

    let successStatusModification = 0;
    for (const result of checkingResult.rows) {
      const allowedStatus = getOrderStatusAvailableUpdateOptions(
        result.status as AdminOrderTypeEnum,
      );

      if (!allowedStatus?.some((s) => s === validatedStatus.data)) {
        logger.warn(
          `[${requestId}] Unavailable order status update for orderId ${result.order_id}`,
        );
        //return res.status(400).json({error: "Invalid order status update action"})
        continue;
      }

      if (result.status === "pending" && newStatus === "cancel") {
      }

      await pool.query<OrderWithCustomer>(
        `UPDATE orders
       SET status = $1
        where order_id = $2`,
        [newStatus, result.order_id],
      );

      successStatusModification++;

      logger.info(
        `[${requestId}] Update order ${result.order_id} status successfully`,
      );
    }

    logger.info(
      `[${requestId}] Total ${successStatusModification} order status update successfully`,
    );

    res.status(200).json({
      message: `Total ${successStatusModification} order status update successfully`,
    });
  } catch (e) {
    logger.error(`[${requestId}] Error in get orders`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};
