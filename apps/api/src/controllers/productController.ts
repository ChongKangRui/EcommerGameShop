import type { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthRequest } from "src/middleWare/auth";
// single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product_id = parseInt(String(id));

    const result = await pool.query(
      "SELECT * FROM products where product_id = $1",
      [product_id], // fetch one extra to check if more exist
    );

    const variationsResult = await pool.query(
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

    res.status(200).json({
      product: result.rows[0],
      variations: variationsResult.rows,
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


    const [productsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM products 
         ${whereClause}
         ORDER BY ${sortColumn} ${sortDirection}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, values),
    ]);

    console.log(`SELECT * FROM products 
       ${whereClause}
       ORDER BY 
       ${sortColumn} ${sortDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`);
    //console.log(countResult);
    res
      .status(200)
      .json({
        products: productsResult.rows,
        productCount: parseInt(countResult.rows[0].count),
        message: "get product Success",
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};