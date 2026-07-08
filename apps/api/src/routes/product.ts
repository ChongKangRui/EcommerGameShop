import {Router} from 'express';
import { requireAuth, isAdmin } from 'src/middleWare/auth';
import { getProduct, getProducts } from "src/controllers/productController";

 const router = Router();

//router.post("/admin/addProduct", requireAuth, isAdmin);

router.get("/", requireAuth, getProducts);
router.get("/:id", requireAuth, getProduct);


export default router;
