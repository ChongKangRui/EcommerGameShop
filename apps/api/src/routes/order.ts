import { Router } from "express";
import { createRefund, getUserOrder, getUserOrderTable, orderConfirm, orderValidation } from "src/controllers/orderController";
import { browsingLimiter, checkoutLimiter, sensitiveActionLimiter } from "src/utils/rateLimitHelper";



const router = Router();

 router.get("/me/:orderId", browsingLimiter, getUserOrder);
 router.get("/me", browsingLimiter, getUserOrderTable);
 router.post("/refund/:orderId", sensitiveActionLimiter, createRefund )
router.get("/:orderId/confirm", checkoutLimiter, orderConfirm);
router.get("/validate/:orderId", checkoutLimiter, orderValidation);

export default router;
