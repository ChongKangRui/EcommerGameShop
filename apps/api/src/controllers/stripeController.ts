
import type { Request, Response } from "express";
import { webHookService } from "src/services/webHookService";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  req.log.info("Stripe webhook request received", { signaturePresent: !!sig });

  // remember to turn off webhook retry after failure
  try {
    const result = await webHookService.handleStripeWebhook(req.body, sig, req.log);
    return res.status(result.status).json(result.body);
  } catch (e) {
    req.log.error("Error processing webhook event", e);
   return res.status(500).json({ error: "Webhook processing failed" });
  }
};