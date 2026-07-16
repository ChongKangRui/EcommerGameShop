import type { Request, Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "src/middleWare/auth";

import {
  cartItemSchema,
  cartItemsSchema,
} from "@ecom/shared/src/cartDataSchema";
import { CartItem, type CartItemResponse } from "@ecom/shared/src/type/cart";

// single product
export const getGuestCartProduct = async (req: Request, res: Response) => {
  try {
    const validationResult = cartItemsSchema.safeParse(req.body);
    // console.log(validationResult);
    const cartItems = validationResult.data?.cartItems;

    if (!cartItems || cartItems.length <= 0) {
      return res.status(500).json({ error: "Invalid action" });
    }

    const variationIds = cartItems.map((item) => item.variation_id);

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

    let adjusted = false;

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
      }

      return {
        ...item,
        quantity: finalQuantity,
      };
    });

    res.status(200).json({
      cartItems: outCartItems,
      adjusted,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const migrateCartItems = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = cartItemsSchema.safeParse(req.body);
    const userId = req.userId;
    let adjusted = false;
    if (validationResult.success) {
      //return res.status(400).json({ error: "Invalid data" });

      const { cartItems } = validationResult.data;

      // fetch stock for all variations at once
      const variationIds = cartItems.map((c) => c.variation_id);
      const stockResult = await pool.query(
        "SELECT variation_id, stock FROM product_variations WHERE variation_id = ANY($1)",
        [variationIds],
      );

      const stockMap = new Map(
        stockResult.rows.map((r) => [r.variation_id, r.stock]),
      );

      await Promise.all(
        cartItems.map((c) => {
          const available = stockMap.get(c.variation_id) ?? 0;
          const cappedQuantity = Math.min(c.quantity, available);

          if (cappedQuantity !== c.quantity) {
            adjusted = true;
          }

          if (cappedQuantity > 0) {
            return pool.query(
              `INSERT INTO cart (user_id, variation_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variation_id)
       DO UPDATE SET quantity = $3`,

              [req.userId, c.variation_id, cappedQuantity],
            );
          }
        }),
      );
    }
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

    res.status(200).json({
      cartItems: result.rows,
      adjusted,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const getCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const cartItemsResult = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    let adjusted = false;
    //console.log(cartItemsResult.rows);

    const outCartItems = cartItemsResult.rows
      .map((item) => {
        // quantity validation
        const maxAllowed = item.stock;
        let finalQuantity = item.quantity;

        // remove from array and cart table if stock went 0
        if (maxAllowed <= 0) {
          adjusted = true;
          pool.query(
            "Delete from cart WHERE variation_id = $1 AND user_id = $2",
            [item.variation_id, userId],
          );
          return null;
        }

        if (item.quantity > maxAllowed) {
          adjusted = true;
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

    res.status(200).json({
      cartItems: outCartItems,
      adjusted,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const addCartItem = async (req: AuthRequest, res: Response) => {
  try {
    // data validation
    const validationResult = cartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { variation_id, quantity } = validationResult.data;
    const userId = req.userId;

    // product existence variation
    const stockResult = await pool.query(
      "SELECT stock FROM product_variations pv WHERE pv.variation_id = $1",
      [variation_id],
    );
    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // stock number validation
    const { stock } = stockResult.rows[0];
    if (stock < quantity) {
      return res.status(400).json({
        error: stock === 0 ? "Out of stock" : `Only ${stock} available`,
      });
    }

    // Upsert: insert if new, update quantity if exists
    await pool.query(
      `INSERT INTO cart (user_id, variation_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variation_id)
       DO UPDATE SET quantity = $3`,
      [userId, variation_id, quantity],
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

    res.status(200).json({
      cartItems: result.rows,
      message: "Add cart product Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = cartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { variation_id, quantity } = validationResult.data;

    const userId = req.userId;

    // product existence variation
    const stockResult = await pool.query(
      "SELECT stock FROM product_variations pv WHERE pv.variation_id = $1",
      [variation_id],
    );
    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // stock number validation
    const { stock } = stockResult.rows[0];
    if (stock < quantity) {
      return res.status(400).json({
        error: stock === 0 ? "Out of stock" : `Only ${stock} available`,
      });
    }

    // update cart item
    await pool.query(
      `UPDATE cart 
          set quantity = $1
       where variation_id = $2 and user_id = $3`,
      [quantity, variation_id, userId],
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

    res.status(200).json({
      cartItems: result.rows,
      message: "Update cart product Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { variation_id } = req.params;
    const userId = req.userId;
    console.log(variation_id);

    // update cart item
    await pool.query(
      `Delete from cart 
       where variation_id = $1 and user_id = $2`,
      [variation_id, userId],
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

    res.status(200).json({
      cartItems: result.rows,
      message: "Delete product success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const validateCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const message = "";

    const result = await pool.query<CartItemResponse>(
      `SELECT ci.quantity, pv.stock
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );

    const badProduct = result.rows.some((p) => p.quantity > p.stock);

    res.status(200).json({
      validationPass: !badProduct,
      message: badProduct
        ? "Some items were adjusted due to stock changes"
        : "",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};
