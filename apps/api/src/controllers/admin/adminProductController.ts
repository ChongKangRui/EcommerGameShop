
import type { Request, Response } from "express";
import formidable from "formidable";
import { logger } from "src/utils/loggerHelper";
import { adminProductService } from "src/services/admin/adminProductService";

export const addProduct = async (req: Request, res: Response) => {
  req.log.info(`Add product request received`);

  try {
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);
    const result = await adminProductService.addProduct(fields, files, req.log);

    if (!result.ok) {
      req.log.error("Validation failed: ", result.error);
      return res
        .status(result.status)
        .json({ error: result.error, details: result.details });
    }
    res.status(200).json(result.data);
  } catch (e) {
    req.log.error(` Error in add product`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id as string);
  logger.info(`Update product request received for ID ${productId}`);

  try {
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);
    const result = await adminProductService.updateProduct(
      productId,
      fields,
      files,
      req.log,
    );

    if (!result.ok) {
      req.log.error("Validation failed: ", result.error);
      return res
        .status(result.status)
        .json({ error: result.error, details: result.details });
    }
    return res.status(200).json(result.data);
  } catch (e) {
    req.log.error(` Error in update product for ID ${productId}`, e);
    return res.status(500).json({ error: "Update failed" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const productId = parseInt(String(req.params.id));

  try {
    const result = await adminProductService.deleteProduct(productId, req.log);
    return res.status(200).json(result);
  } catch (e) {
    req.log.error(` Error in delete product for ID ${productId}`, e);
    return res.status(500).json({ error: "Delete failed" });
  }
};

export const deleteProducts = async (req: Request, res: Response) => {
  const productIds = req.body;

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      req.log.error("Invalid product IDs ");
      return res.status(400).json({ error: "Invalid product IDs" });
    }
    const result = await adminProductService.deleteProducts(
      productIds,
      req.log,
    );
    return res.status(200).json(result);
  } catch (e) {
    req.log.error(` Error in bulk delete`, e);
    return res.status(500).json({ error: "Delete failed" });
  }
};

export const discountProducts = async (req: Request, res: Response) => {
  const { productIds, discountPercentage } = req.body.data;

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      req.log.error("Invalid product IDs ");
      return res.status(400).json({ error: "Invalid product IDs" });
    }
    return res
      .status(200)
      .json(
        await adminProductService.discountProducts(
          productIds,
          discountPercentage,
        ),
      );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
     req.log.error("Error: ", message);
    return res.status(500).json({ error: "discount state update failed" });
  }
};

export const promoteProducts = async (req: Request, res: Response) => {
  const { productIds, promote } = req.body.data;

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs" });
    }
    return res
      .status(200)
      .json(await adminProductService.promoteProducts(productIds, promote));
  } catch (e) {
    req.log.error(` Error in bulk promote`, e);
    return res.status(500).json({ error: "Set promote state failed" });
  }
};

export const activeProducts = async (req: Request, res: Response) => {
  const { productIds, active } = req.body.data;

  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs" });
    }
    return res
      .status(200)
      .json(await adminProductService.activeProducts(productIds, active));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ error: message });
  }
};
