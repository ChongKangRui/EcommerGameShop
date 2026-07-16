import { Router } from "express";
import { orderConfirm } from "src/controllers/orderController";
import { requireAuth } from "src/middleWare/auth";



const router = Router();


router.get("/:orderId/confirm", requireAuth, orderConfirm);


export default router;
