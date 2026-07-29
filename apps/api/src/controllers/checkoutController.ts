
import type { Response } from "express";
import { AuthRequest } from "src/middleWare/auth";
import { checkoutService } from "src/services/checkoutService";

export const initCheckout = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized action" });
  }

  req.log.info("Init checkout request received", { userId });

  try {
    const result = await checkoutService.initCheckout(userId, req.log);
    
    return res.status(result.status).json(result.body);

  } catch (e) {
    req.log.error("Error in init checkout", e);
    return res.status(500).json({ error: "Unable to start checkout" });
  }
};