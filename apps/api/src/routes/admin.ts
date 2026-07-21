import { Router } from "express";
import { requireAuth, isAdmin } from "src/middleWare/auth";
import { getProduct, getProducts } from "src/controllers/productController";
import { activeProducts, addProduct, deleteProduct, deleteProducts, discountProducts, getAllOrders, getOrder, promoteProducts, updateOrdersStatus, updateOrderStatus, updateProduct } from "src/controllers/adminController";
import {upload} from "../middleWare/upload";


const router = Router();


router.post("/products", requireAuth, isAdmin, addProduct);
router.get("/orders", requireAuth, isAdmin);
router.get("/orders/:orderId", requireAuth, isAdmin, getOrder);
router.patch("/order/:orderId/status", requireAuth, isAdmin, updateOrderStatus);
router.patch("/orders/status", requireAuth, isAdmin, updateOrdersStatus);
// router.get("/products/", requireAuth, isAdmin, getProducts);
// router.get("/products/:id", requireAuth, isAdmin, getProduct);
router.get("/products", requireAuth, isAdmin,getProducts);
router.put("/products/:id", requireAuth, isAdmin, updateProduct);
router.patch("/products/discount", requireAuth, isAdmin,  discountProducts);
router.patch("/products/promote", requireAuth, isAdmin,  promoteProducts);
router.patch("/products/active", requireAuth, isAdmin,  activeProducts);
router.delete("/product/:id", requireAuth, isAdmin, deleteProduct);
router.delete("/products/", requireAuth, isAdmin, deleteProducts);
router.get("/orders", requireAuth, isAdmin, getAllOrders);
export default router;
