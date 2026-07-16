import {Router} from 'express';
import { requireAuth } from 'src/middleWare/auth';

import { initCheckout } from 'src/controllers/checkoutController';

 const router = Router();

//router.post("/admin/addProduct", requireAuth, isAdmin);

// use post here because we need guest passing in their cart item data


router.post("/init", requireAuth, initCheckout);
//router.post("/");

//router.get("/:id", requireAuth, getProduct);


export default router;
