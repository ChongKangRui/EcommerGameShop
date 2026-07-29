
import type { Request, Response } from "express";
import { AuthRequest } from "src/middleWare/auth";
import { cartService } from "src/services/cartService";

export const getGuestCartProduct = async (req: Request, res: Response) => {
  try {
    const result = await cartService.getGuestCartProduct(req.body, req.log);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
  return  res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in get guest cart product", e);
   return res.status(500).json({ error: "Invalid action" });
  }
};

export const migrateCartItems = async (req: AuthRequest, res: Response) => {
  req.log.debug("Migrate cart items request received");
  try {
    const result = await cartService.migrateCartItems(req.userId!, req.body, req.log);
  return  res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in migrate cart items", e);
   return res.status(500).json({ error: "Invalid action" });
  }
};

export const getCartItem = async (req: AuthRequest, res: Response) => {
  req.log.debug("Get cart items request received");
  try {
    const result = await cartService.getCartItem(req.userId!, req.log);
  return  res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in get cart items", e);
   return res.status(500).json({ error: "Invalid action" });
  }
};

export const addCartItem = async (req: AuthRequest, res: Response) => {
  req.log.debug("Add cart item request received");
  try {
    const result = await cartService.addCartItem(req.userId!, req.body, req.log);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
  return  res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in add cart item", e);
  return  res.status(500).json({ error: "Invalid action" });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  req.log.debug("Update cart item request received");
  try {
    const result = await cartService.updateCartItem(req.userId!, req.body, req.log);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
   return res.status(200).json(result.data);
  } catch (e) {
    req.log.error("Error in update cart item", e);
   return res.status(500).json({ error: "Invalid action" });
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  const { variation_id } = req.params;
  req.log.debug("Delete cart item request received");
  try {
    const result = await cartService.deleteCartItem(req.userId!, String(variation_id), req.log);
   return res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in delete cart item", e);
   return res.status(500).json({ error: "Invalid action" });
  }
};

export const validateCart = async (req: AuthRequest, res: Response) => {
  req.log.debug("Validate cart request received");
  try {
    const result = await cartService.validateCart(req.userId!, req.log);
   return res.status(200).json(result);
  } catch (e) {
    req.log.error("Error in validate cart", e);
  return res.status(500).json({ error: "Invalid action" });
  }
};