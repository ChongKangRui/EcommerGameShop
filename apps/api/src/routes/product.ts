import {Router} from 'express';

import { getProduct, getProducts, getPromotedProducts } from "src/controllers/productController";

 const router = Router();

router.get("/promoted", getPromotedProducts)
router.get("/", getProducts);
router.get("/:id", getProduct);


export default router;
