import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/db";
import { AuthRequest } from "src/middleWare/auth";
import { Product, ProductVariation } from "@ecom/shared/src/type/product";
import { generateLogId, logger } from "src/utils/loggerHelper";
// single product
export const getProduct = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  const { id } = req.params;
  const product_id = parseInt(String(id));
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get product request received for product ID: ${product_id}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  try {
    logger.debug(`[${requestId}] Fetching product ${product_id} from database`);
    
    const result = await pool.query<Product>(
      "SELECT * FROM products where product_id = $1 AND is_active = true",
      [product_id],
    );

    logger.debug(`[${requestId}] Product query returned ${result.rowCount} rows`);

    const variationsResult = await pool.query<ProductVariation>(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [product_id],
    );

    logger.debug(`[${requestId}] Variations query returned ${variationsResult.rowCount} rows`);

    if (result.rowCount === 0 || variationsResult.rowCount === 0) {
      logger.warn(`[${requestId}] Product ${product_id} not found or has no variations`);
      return res.status(404).json({ error: "No product found" });
    }

    logger.info(`[${requestId}] Product ${product_id} found with ${variationsResult.rowCount} variations`);

    const product = result.rows[0];

    const finalVariationsResult = variationsResult.rows.map((v) => {
      const price = parseFloat(product.price);
      const priceOffset = parseFloat(v.price_offset);
      const discount_percentage = parseFloat(product.discount_percentage);

      const PriceWithOffset = price + priceOffset;
      const final_price = PriceWithOffset - (PriceWithOffset * (discount_percentage / 100));

      return { ...v, final_price };
    });

    res.status(200).json({
      product: result.rows[0],
      variations: finalVariationsResult,
      message: "get product Success",
    });
    
    logger.info(`[${requestId}] Get product request completed successfully for product ${product_id}`);
    
  } catch (e) {
    logger.error(`[${requestId}] Error in get product for ID ${product_id}`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Get products request received`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    role: req.role,
    query: req.query
  });

  try {
    const limit = parseInt(String(req.query.limit ?? "")) || 5;
    const offset = parseInt(String(req.query.offset ?? "")) || 0;
    const sortParam = String(req.query.sortBy ?? "release_date:desc");
    const [sortColumn, sortDirection] = sortParam.split(":");
    const filterParam = String(req.query.filterBy ?? "all");
    const search = req.query.search ? String(req.query.search) : null;
    const showNonActive = req.query.showNonActive ? req.query.showNonActive === 'true' : false;

    // EXACTLY the same as original - just added a log before the logic
    logger.debug(`[${requestId}] Query params: limit=${limit}, offset=${offset}, sort=${sortParam}, filter=${filterParam}, search=${search}`);

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // use this to check if it was admin 
    // and return additional information such as sales number
    const isAdmin = req.role === 'admin';

    if(!isAdmin || !showNonActive){
      conditions.push(`is_active = ${true}`);
      console.log("not showing non active" + req.role);
      //values.push(`%${true}%`);
      //paramIndex++;
    }
   

    if (search) {
      console.log(search); // KEPT THE ORIGINAL CONSOLE.LOG
      conditions.push(`name ILIKE $${paramIndex}`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (filterParam !== "all") {
      conditions.push(`type = $${paramIndex}`);
      values.push(`${filterParam}`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [productResults, countResult] = await Promise.all([
      pool.query<Product>(
        `SELECT p.*,
         COALESCE(SUM(pv.stock), 0) as total_stock,
          p.price * (1 - p.discount_percentage / 100.0) AS discounted_price
       FROM products p
       LEFT JOIN product_variations pv ON p.product_id = pv.product_id
       ${whereClause}
       GROUP BY p.product_id
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values),
    ]);

    logger.info(`[${requestId}] Query returned ${productResults.rows.length} products out of ${parseInt(countResult.rows[0].count)} total`);

    res.status(200).json({
      products: productResults.rows,
      productCount: parseInt(countResult.rows[0].count),
      message: "get product Success",
    });
    
    logger.info(`[${requestId}] Get products request completed successfully`);
    
  } catch (e) {
    logger.error(`[${requestId}] Error in get products`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};