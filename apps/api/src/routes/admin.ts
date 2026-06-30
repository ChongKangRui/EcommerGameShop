import { Router } from "express";
import { requireAuth, isAdmin } from "src/middleWare/auth";
import { addProduct } from "src/controllers/adminController";
import {upload} from "../middleWare/upload";


const router = Router();


router.post("/addProduct", requireAuth, isAdmin, addProduct);
router.get("/orders", requireAuth);
router.put("/products/:id", requireAuth);
router.delete("/products/:id", requireAuth);

export default router;
