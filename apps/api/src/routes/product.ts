import {Router} from 'express';

import { getProduct, getProducts } from "src/controllers/productController";

 const router = Router();

//router.post("/admin/addProduct", requireAuth, isAdmin);

router.get("/", getProducts);
router.get("/:id", getProduct);


export default router;
