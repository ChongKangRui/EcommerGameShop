

import type {Response } from "express";
import { AuthRequest } from "src/middleWare/auth";
import { productService } from "src/services/productService";

export const getProduct = async (req: AuthRequest, res: Response) => {
  const productId = parseInt(String(req.params.id));
  req.log.info(`Get product request received for product ID: ${productId}`);

  try {
    const isAdmin = req.role === "admin";
    const result = await productService.getProduct(productId, req.userId ?? "", isAdmin, req.log);
    if (!result.ok)
      return res.status(result.status).json({ error: result.error });

    req.log.info(
      `Get product request completed successfully for product ${productId}`,
    );
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error(`Error in get product for ID ${productId}`, e);
    return res.status(500).json({ error: "Invalid action" });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  req.log.debug("Get products request received", {
    role: req.role,
    query: req.query,
  });

  try {
    const result = await productService.getProducts(
      req.query,
      req.role,
      req.log,
    );
    req.log.info("Get products request completed successfully");
    return res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in get products", e);
    return res.status(500).json({ error: "Invalid action" });
  }
};

export const getPromotedProducts = async (req: AuthRequest, res: Response) => {
  req.log.debug("Get promoted products request received");

  try {
    const result = await productService.getPromotedProducts(req.log);
    req.log.info("Get products request completed successfully");
    return res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in get products", e);
    return res.status(500).json({ error: "Invalid action" });
  }
};
