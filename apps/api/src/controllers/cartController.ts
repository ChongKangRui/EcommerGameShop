import type { Request, Response } from "express";
import { pool } from "../db/db";
import { AuthRequest } from "src/middleWare/auth";

import {
  cartItemSchema,
  cartItemsSchema,
} from "@ecom/shared/src/cartDataSchema";
import { CartItem, type CartItemResponse } from "@ecom/shared/src/type/cart";
import { generateLogId } from "src/utils/loggerHelper";
import { logger } from "src/utils/loggerHelper";

// single product
export const getGuestCartProduct = async (req: Request, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get guest cart product request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  try {
    logger.debug(`[${requestId}] Validating cart items from request body`);
    const validationResult = cartItemsSchema.safeParse(req.body);
    // console.log(validationResult);
    const cartItems = validationResult.data?.cartItems;

    if (!cartItems || cartItems.length <= 0) {
      logger.warn(`[${requestId}] No cart items provided or empty cart`);
      return res.status(500).json({ error: "Invalid action" });
    }

    logger.debug(`[${requestId}] Processing ${cartItems.length} cart items`);

    const variationIds = cartItems.map((item) => item.variation_id);
    logger.debug(`[${requestId}] Variation IDs: ${variationIds.join(", ")}`);

    logger.debug(`[${requestId}] Fetching product details for variations`);
    const cartItemsResult = await pool.query<CartItemResponse>(
      `SELECT pv.*,
       p.name,
       (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
   FROM product_variations pv
   JOIN products p ON pv.product_id = p.product_id
   WHERE pv.variation_id = ANY($1)
   ORDER BY pv.created_at ASC`,
      [variationIds],
    );

    logger.debug(
      `[${requestId}] Found ${cartItemsResult.rows.length} products`,
    );

    let adjusted = false;

    logger.debug(
      `[${requestId}] Adjusting quantities based on stock availability`,
    );
    const outCartItems = cartItemsResult.rows.map((item) => {
      const quantity = cartItems.find(
        (c) => c.variation_id === item.variation_id,
      )?.quantity;

      if (!quantity) {
        throw new Error();
      }
      const maxAllowed = item.stock;
      //const final_price = Number(item.final_price).toFixed(2);
      const finalQuantity = Math.min(quantity, maxAllowed);
      if (finalQuantity !== quantity) {
        adjusted = true;
        logger.debug(
          `[${requestId}] Adjusted quantity for variation ${item.variation_id}: ${quantity} -> ${finalQuantity}`,
        );
      }

      return {
        ...item,
        quantity: finalQuantity,
      };
    });

    logger.info(`[${requestId}] Guest cart processed successfully`, {
      itemsCount: outCartItems.length,
      adjusted: adjusted,
    });

    res.status(200).json({
      cartItems: outCartItems,
      adjusted,
    });

    logger.info(`[${requestId}] Get guest cart product request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in get guest cart product`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const migrateCartItems = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Migrate cart items request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
  });

  try {
    logger.debug(`[${requestId}] Validating cart items for migration`);
    const validationResult = cartItemsSchema.safeParse(req.body);
    const userId = req.userId;
    let adjusted = false;

    if (validationResult.success) {
      //return res.status(400).json({ error: "Invalid data" });

      const { cartItems } = validationResult.data;
      logger.debug(
        `[${requestId}] Migrating ${cartItems.length} cart items for user ${userId}`,
      );

      // fetch stock for all variations at once
      const variationIds = cartItems.map((c) => c.variation_id);
      logger.debug(
        `[${requestId}] Fetching stock for ${variationIds.length} variations`,
      );

      const stockResult = await pool.query(
        "SELECT variation_id, stock FROM product_variations WHERE variation_id = ANY($1)",
        [variationIds],
      );

      const stockMap = new Map(
        stockResult.rows.map((r) => [r.variation_id, r.stock]),
      );

      logger.debug(
        `[${requestId}] Stock map created with ${stockMap.size} entries`,
      );

      await Promise.all(
        cartItems.map((c) => {
          const available = stockMap.get(c.variation_id) ?? 0;
          const cappedQuantity = Math.min(c.quantity, available);

          if (cappedQuantity !== c.quantity) {
            adjusted = true;
            logger.debug(
              `[${requestId}] Adjusted quantity for variation ${c.variation_id}: ${c.quantity} -> ${cappedQuantity}`,
            );
          }

          if (cappedQuantity > 0) {
            return pool.query(
              `INSERT INTO cart (user_id, variation_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variation_id)
       DO UPDATE SET quantity = $3`,

              [req.userId, c.variation_id, cappedQuantity],
            );
          } else {
            logger.debug(
              `[${requestId}] Skipping variation ${c.variation_id} - quantity capped to 0`,
            );
          }
        }),
      );

      logger.info(
        `[${requestId}] Migration completed with adjusted: ${adjusted}`,
      );
    } else {
      logger.warn(
        `[${requestId}] Validation failed for cart items migration`,
        validationResult.error,
      );
    }

    logger.debug(`[${requestId}] Fetching final cart items for user ${userId}`);
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    console.log(result.rows);
    logger.info(
      `[${requestId}] Migrated cart items: ${result.rows.length} items`,
    );

    res.status(200).json({
      cartItems: result.rows,
      adjusted,
    });

    logger.info(`[${requestId}] Migrate cart items request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in migrate cart items`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const getCartItem = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get cart items request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
  });

  try {
    const userId = req.userId;
    logger.debug(`[${requestId}] Fetching cart items for user ${userId}`);

    const cartItemsResult = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name, p.is_active,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    logger.debug(
      `[${requestId}] Found ${cartItemsResult.rows.length} cart items`,
    );

    let adjusted = false;
    //console.log(cartItemsResult.rows);

    logger.debug(`[${requestId}] Validating quantities and stock availability`);
    const outCartItems = cartItemsResult.rows
      .map((item) => {
        // quantity validation
        const maxAllowed = item.stock;
        let finalQuantity = item.quantity;
        const isActive = item.is_active;

        // remove from array and cart table if stock went 0
        if (maxAllowed <= 0 || !isActive) {
          adjusted = true;
          logger.debug(
            `[${requestId}] Removing variation ${item.variation_id} - out of stock`,
          );
          pool.query(
            "Delete from cart WHERE variation_id = $1 AND user_id = $2",
            [item.variation_id, userId],
          );
          return null;
        }

        if (item.quantity > maxAllowed) {
          adjusted = true;
          logger.debug(
            `[${requestId}] Adjusted quantity for variation ${item.variation_id}: ${item.quantity} -> ${maxAllowed}`,
          );
          // update DB to cap quantity
          finalQuantity = maxAllowed;
          pool.query(
            "UPDATE cart SET quantity = $1 WHERE variation_id = $2 AND user_id = $3",
            [finalQuantity, item.variation_id, userId],
          );
          // return { ...item, quantity: newQuantity };
        }

        const final_price = Number(item.final_price).toFixed(2);

        return { ...item, quantity: finalQuantity, final_price: final_price };
      })
      .filter(Boolean);

    logger.info(`[${requestId}] Cart items processed`, {
      outCartItemsLength: outCartItems.length,
      adjusted: adjusted,
    });

    res.status(200).json({
      cartItems: outCartItems,
      adjusted,
    });

    logger.info(`[${requestId}] Get cart items request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in get cart items`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const addCartItem = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Add cart item request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
    body: req.body,
  });

  try {
    // data validation
    logger.debug(`[${requestId}] Validating cart item data`);
    const validationResult = cartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(
        `[${requestId}] Invalid cart item data`,
        validationResult.error,
      );
      return res.status(400).json({ error: "Invalid data" });
    }

    const { variation_id, quantity } = validationResult.data;
    const userId = req.userId;

    logger.debug(
      `[${requestId}] Adding variation ${variation_id} with quantity ${quantity} for user ${userId}`,
    );

    // product existence variation
    logger.debug(`[${requestId}] Checking stock for variation ${variation_id}`);
    const stockResult = await pool.query(
      "SELECT stock FROM product_variations pv WHERE pv.variation_id = $1",
      [variation_id],
    );
    if (stockResult.rows.length === 0) {
      logger.warn(`[${requestId}] Variation ${variation_id} not found`);
      return res.status(404).json({ error: "Product not found" });
    }

    // stock number validation
    const { stock } = stockResult.rows[0];
    logger.debug(
      `[${requestId}] Current stock for variation ${variation_id}: ${stock}`,
    );

    if (stock < quantity) {
      logger.warn(
        `[${requestId}] Insufficient stock for variation ${variation_id}: requested ${quantity}, available ${stock}`,
      );
      return res.status(400).json({
        error: stock === 0 ? "Out of stock" : `Only ${stock} available`,
      });
    }

    // Upsert: insert if new, update quantity if exists
    logger.debug(
      `[${requestId}] Upserting cart item for user ${userId}, variation ${variation_id}`,
    );
    await pool.query(
      `INSERT INTO cart (user_id, variation_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variation_id)
       DO UPDATE SET quantity = $3`,
      [userId, variation_id, quantity],
    );

    logger.debug(
      `[${requestId}] Fetching updated cart items for user ${userId}`,
    );
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    //console.log(result.rows);
    logger.info(
      `[${requestId}] Cart item added successfully for user ${userId}`,
      {
        variationId: variation_id,
        quantity: quantity,
        totalItems: result.rows.length,
      },
    );

    res.status(200).json({
      cartItems: result.rows,
      message: "Add cart product Success",
    });

    logger.info(`[${requestId}] Add cart item request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in add cart item`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Update cart item request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
    body: req.body,
  });

  try {
    logger.debug(`[${requestId}] Validating cart item data for update`);
    const validationResult = cartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(
        `[${requestId}] Invalid cart item data for update`,
        validationResult.error,
      );
      return res.status(400).json({ error: "Invalid data" });
    }

    const { variation_id, quantity } = validationResult.data;
    const userId = req.userId;

    logger.debug(
      `[${requestId}] Updating variation ${variation_id} to quantity ${quantity} for user ${userId}`,
    );

    // product existence variation
    logger.debug(`[${requestId}] Checking stock for variation ${variation_id}`);
    const stockResult = await pool.query(
      `SELECT pv.stock, pv.product_id
   FROM product_variations pv
   JOIN products p ON pv.product_id = p.product_id
   WHERE pv.variation_id = $1 AND p.is_active = true`,
      [variation_id],
    );
    if (stockResult.rows.length === 0) {
      logger.warn(
        `[${requestId}] Variation ${variation_id} not found for update`,
      );
      return res.status(404).json({ error: "Product not found" });
    }

    // stock number validation
    const { stock } = stockResult.rows[0];
    logger.debug(
      `[${requestId}] Current stock for variation ${variation_id}: ${stock}`,
    );

    if (stock < quantity) {
      logger.warn(
        `[${requestId}] Insufficient stock for variation ${variation_id}: requested ${quantity}, available ${stock}`,
      );
      return res.status(400).json({
        error: stock === 0 ? "Out of stock" : `Only ${stock} available`,
      });
    }

    // update cart item
    logger.debug(
      `[${requestId}] Updating cart item for user ${userId}, variation ${variation_id}`,
    );
    await pool.query(
      `UPDATE cart 
          set quantity = $1
       where variation_id = $2 and user_id = $3`,
      [quantity, variation_id, userId],
    );

    logger.debug(
      `[${requestId}] Fetching updated cart items for user ${userId}`,
    );
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    console.log(result.rows);
    logger.info(
      `[${requestId}] Cart item updated successfully for user ${userId}`,
      {
        variationId: variation_id,
        quantity: quantity,
        totalItems: result.rows.length,
      },
    );

    res.status(200).json({
      cartItems: result.rows,
      message: "Update cart product Success",
    });

    logger.info(`[${requestId}] Update cart item request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in update cart item`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Delete cart item request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
    params: req.params,
  });

  try {
    const { variation_id } = req.params;
    const userId = req.userId;
    console.log(variation_id);

    logger.debug(
      `[${requestId}] Deleting variation ${variation_id} from cart for user ${userId}`,
    );

    // update cart item
    await pool.query(
      `Delete from cart 
       where variation_id = $1 and user_id = $2`,
      [variation_id, userId],
    );

    logger.debug(
      `[${requestId}] Fetching remaining cart items for user ${userId}`,
    );
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    logger.info(
      `[${requestId}] Cart item deleted successfully for user ${userId}`,
      {
        variationId: variation_id,
        remainingItems: result.rows.length,
      },
    );

    res.status(200).json({
      cartItems: result.rows,
      message: "Delete product success",
    });

    logger.info(`[${requestId}] Delete cart item request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in delete cart item`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const validateCart = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Validate cart request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
  });

  try {
    const userId = req.userId;

    logger.debug(`[${requestId}] Validating cart items for user ${userId}`);
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.quantity, pv.stock
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1 and p.is_active`,
      [userId],
    );

    logger.debug(
      `[${requestId}] Found ${result.rows.length} cart items to validate`,
    );

    const badProduct =
      result.rows.some((p) => p.quantity > p.stock) || result.rows.length <= 0;

    if (badProduct) {
      logger.warn(
        `[${requestId}] Cart validation failed - some items exceed stock`,
      );
    } else {
      logger.info(
        `[${requestId}] Cart validation passed - all items within stock limits`,
      );
    }

    res.status(200).json({
      validationPass: !badProduct,
      message: badProduct
        ? "Some items were adjusted due to stock changes"
        : "",
    });

    logger.info(`[${requestId}] Validate cart request completed`);
  } catch (e) {
    logger.error(`[${requestId}] Error in validate cart`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};
