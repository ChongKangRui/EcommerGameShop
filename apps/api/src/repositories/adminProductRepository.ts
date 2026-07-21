import { PoolClient } from "pg";
import { pool } from "../db/db";
import {type ProductFormData} from "@ecom/shared/src/productSchema"

export const adminProductRepository = {
  async exists(productId: number) {
    const r = await pool.query("SELECT product_id FROM products WHERE product_id = $1", [productId]);
    return r.rows.length > 0;
  },

  async findVariationsByProductId(productId: number) {
    const r = await pool.query("SELECT * FROM product_variations WHERE product_id = $1", [productId]);
    return r.rows;
  },

  async findVariationsByProductIdOrdered(productId: number) {
    const r = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [productId],
    );
    return r.rows;
  },

  async findVariationsByProductIds(productIds: number[]) {
    const r = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = ANY($1) ORDER BY created_at ASC",
      [productIds],
    );
    return r.rows;
  },

  async hasOrderHistory(productId: number) {
    const r = await pool.query("SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1", [productId]);
    return r.rows.length > 0;
  },

  async deactivate(productId: number) {
    await pool.query("UPDATE products SET is_active = false WHERE product_id = $1", [productId]);
  },

  async delete(productId: number) {
    await pool.query("DELETE FROM products WHERE product_id = $1", [productId]);
  },

  async bulkDelete(productIds: number[]) {
    await pool.query("DELETE FROM products WHERE product_id = ANY($1)", [productIds]);
  },

  async deleteCartByVariationIds(variationIds: string[]) {
    await pool.query("DELETE FROM cart WHERE variation_id = ANY($1)", [variationIds]);
  },

  async bulkUpdateDiscount(productIds: number[], discountPercentage: number) {
    await pool.query("UPDATE products SET discount_percentage = $1 WHERE product_id = ANY($2)", [discountPercentage, productIds]);
  },

  async bulkUpdatePromote(productIds: number[], promote: boolean) {
    await pool.query("UPDATE products SET push_home_page = $1 WHERE product_id = ANY($2)", [promote, productIds]);
  },

  async bulkUpdateActive(productIds: number[], active: boolean) {
    await pool.query("UPDATE products SET is_active = $1 WHERE product_id = ANY($2)", [active, productIds]);
  },

  // --- transactional variants, always called with a client from withTransaction ---

  async insertProduct(client: PoolClient, data: {
    name: string; coverImageUrl: string; price: number; type: string;
    releaseDate: string; pushHomePage: boolean; discountPercentage: number;
  }): Promise<number> {
    const r = await client.query(
      `INSERT INTO products (name, cover_image_url, price, type, release_date, push_home_page, discount_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING product_id`,
      [data.name, data.coverImageUrl, data.price, data.type, data.releaseDate, data.pushHomePage, data.discountPercentage],
    );
    return r.rows[0].product_id;
  },

  async updateProductRow(client: PoolClient, productId: number, data: {
    name: string; coverImageUrl: string; price: number; type: string; releaseDate: string;
    pushHomePage: boolean;isActive:boolean ; discountPercentage: number; description: string;
  }) {
    await client.query(
      `UPDATE products SET name=$1, cover_image_url=$2, price=$3, type=$4,
         release_date=$5, push_home_page=$6, discount_percentage=$7, description=$8, updated_at=NOW()
       WHERE product_id=$9`,
      [data.name, data.coverImageUrl, data.price, data.type, data.releaseDate,
       data.pushHomePage, data.discountPercentage, data.description, productId],
    );
  },

  async insertVariation(client: PoolClient, productId: number, v: {
    label: string; imageUrl: string; imagePublicId: string; stock: number; priceOffset: number;
  }) {
    await client.query(
      `INSERT INTO product_variations (product_id, label, image_url, image_public_Id, stock, price_offset)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, v.label, v.imageUrl, v.imagePublicId, v.stock, v.priceOffset],
    );
  },

  async updateVariation(client: PoolClient, v: {
    variationId: string; label: string; imageUrl: string; imagePublicId: string;
    stock: number; priceOffset: number;
  }) {
    await client.query(
      `UPDATE product_variations SET label=$1, image_url=$2, image_public_id=$3,
         stock=$4, price_offset=$5, updated_at=NOW() WHERE variation_id=$6`,
      [v.label, v.imageUrl, v.imagePublicId, v.stock, v.priceOffset, v.variationId],
    );
  },

  async deleteVariations(client: PoolClient, variationIds: string[]) {
    await client.query("DELETE FROM product_variations WHERE variation_id = ANY($1)", [variationIds]);
  },
};