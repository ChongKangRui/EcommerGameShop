import {Router} from 'express';
import { requireAuth } from 'src/middleWare/auth';

import { stripeWebhook } from 'src/controllers/stripeController';

 const router = Router();

//router.post("/admin/addProduct", requireAuth, isAdmin);

// use post here because we need guest passing in their cart item data


router.post("/webhook", stripeWebhook);

//router.get("/:id", requireAuth, getProduct);


export default router;
