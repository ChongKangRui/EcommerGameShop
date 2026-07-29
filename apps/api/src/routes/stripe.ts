import {Router} from 'express';

import { stripeWebhook } from 'src/controllers/stripeController';

 const router = Router();

router.post("/webhook", stripeWebhook);


export default router;
