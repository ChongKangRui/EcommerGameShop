import {Router} from 'express';

import { getProduct, getProducts, getPromotedProducts } from "src/controllers/productController";
import { authObtain } from 'src/middleWare/auth';

 const router = Router();

router.get("/promoted", getPromotedProducts)
router.get("/", getProducts);
router.get("/:id", authObtain, getProduct);


export default router;
