import { Router } from "express";
import { requireAuth } from "src/middleWare/auth";

const router = Router();

router.post("/admin/products", requireAuth);
router.get("/admin/products", requireAuth);
router.get("/admin/orders", requireAuth);
router.put("/admin/products/:id", requireAuth);
router.delete("/admin/products/:id", requireAuth);

export default router;
