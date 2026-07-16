import type { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthRequest } from "src/middleWare/auth";
import { Product, ProductVariation } from "@ecom/shared/src/type/product";
// single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product_id = parseInt(String(id));

    const result = await pool.query<Product>(
      "SELECT * FROM products where product_id = $1",
      [product_id], // fetch one extra to check if more exist
    );

    const variationsResult = await pool.query<ProductVariation>(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [product_id],
    );

    // console.log(
    //   "------------------------product result-------------------------",
    // );
    // console.log(result.rows, product_id);
    // console.log(
    //   "------------------------variations result-------------------------",
    // );
    // console.log(variationsResult.rows, product_id);

    if (result.rowCount === 0 || variationsResult.rowCount === 0) {
      return res.status(404).json({ error: "No product found" });
    }

    const product = result.rows[0];

    const finalVariationsResult = variationsResult.rows.map((v)=>{

      const price = parseFloat(product.price);
      const priceOffset = parseFloat(v.price_offset);
      const discount_percentage = parseFloat(product.discount_percentage);

      const PriceWithOffset = price + priceOffset;
      const final_price = PriceWithOffset - (PriceWithOffset * (discount_percentage/100));


      return {...v, final_price}
    })


    res.status(200).json({
      product: result.rows[0],
      variations: finalVariationsResult,
      message: "get product Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "")) || 5;
    const offset = parseInt(String(req.query.offset ?? "")) || 0;
    const sortParam = String(req.query.sortBy ?? "release_date:desc");
    const [sortColumn, sortDirection] = sortParam.split(":");
    const filterParam = String(req.query.filterBy ?? "all");
    const search = req.query.search ? String(req.query.search) : null;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // use this to check if it was admin 
    // and return additional information such as sales number
    const isAdmin = req.role === 'admin';

    if (search) {
      console.log(search);
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
      )
      ,
      pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values),
    ]);

    
  
    res
      .status(200)
      .json({
        products: productResults.rows,
        productCount: parseInt(countResult.rows[0].count),
        message: "get product Success",
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};