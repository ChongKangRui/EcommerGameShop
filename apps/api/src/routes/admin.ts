import { Router } from "express";
import { requireAuth, isAdmin } from "src/middleWare/auth";
import { getProduct, getProducts } from "src/controllers/productController";
import { addProduct, deleteProduct, updateProduct } from "src/controllers/adminController";
import {upload} from "../middleWare/upload";


const router = Router();


router.post("/products", requireAuth, isAdmin, addProduct);
router.get("/orders", requireAuth, isAdmin);
// router.get("/products/", requireAuth, isAdmin, getProducts);
// router.get("/products/:id", requireAuth, isAdmin, getProduct);
router.put("/products/:id", requireAuth, isAdmin, updateProduct);
router.delete("/products/:id", requireAuth, isAdmin, deleteProduct);

export default router;
