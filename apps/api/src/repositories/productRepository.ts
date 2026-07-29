import { pool } from "src/db/db";
import { Product, ProductVariation } from "@ecom/shared/src/type/product";
import { type ProductListRepositoryFilter } from "@ecom/shared/src/type/search";

export const productRepository = {
  async getActiveProductById(productId: number, OnlyActiveProduct: boolean) {
    const result = await pool.query<Product>(
      `SELECT * FROM products WHERE product_id = $1 ${OnlyActiveProduct ? "AND is_active = true" : ""}`,
      [productId],
    );
    return result.rows[0] ?? null;
  },

  async getProductVariationsByProductId(productId: number) {
    const result = await pool.query<ProductVariation>(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [productId],
    );
    return result.rows;
  },

  buildListConditions(f: ProductListRepositoryFilter) {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (!f.includeInactive) {
      conditions.push(`is_active = $${paramIndex}`);
      values.push(true);
      paramIndex++;
    }

    if (f.search) {
      const sanitized = f.search
        .slice(0, 100)
        .trim()
        .replace(/\\/g, "\\\\") // escape backslashes FIRST
        .replace(/[%_]/g, "\\$&"); // then escape wildcards
      conditions.push(`name ILIKE $${paramIndex}`);
      values.push(`%${sanitized}%`);
      paramIndex++;
    }

    if (f.filterBy !== "all") {
      conditions.push(`type = $${paramIndex}`);
      values.push(f.filterBy);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { whereClause, values, paramIndex };
  },

  async getProductList(f: ProductListRepositoryFilter) {
    const { whereClause, values, paramIndex } = this.buildListConditions(f);

    const [column, sortDirection] = (f.sortBy ?? "release_date:desc").split(
      ":",
    );

    const [productResults, countResult] = await Promise.all([
      pool.query<Product>(
        `SELECT p.*,
           COALESCE(SUM(pv.stock), 0) as total_stock,
           p.price * (1 - p.discount_percentage / 100.0) AS discounted_price,
           COALESCE(SUM(mps.revenue), 0) as revenue
         FROM products p
         LEFT JOIN product_variations pv ON p.product_id = pv.product_id
         LEFT JOIN monthly_product_sales mps on p.product_id = mps.product_id
         ${whereClause}
         GROUP BY p.product_id
         ORDER BY ${column} ${sortDirection}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, f.limit, f.offset],
      ),
      pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values),
    ]);

    return {
      products: productResults.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  async getPromotedProductList() {
    const productResults = await pool.query<Product>(
      `SELECT p.*,
           p.price * (1 - p.discount_percentage / 100.0) AS discounted_price
         FROM products p
         where p.push_home_page = true and p.is_active = true`,
    );

    return {
      products: productResults.rows,
    };
  },
  
};
