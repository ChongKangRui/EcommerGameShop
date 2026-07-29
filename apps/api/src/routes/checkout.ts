import {Router} from 'express';

import { initCheckout } from 'src/controllers/checkoutController';

 const router = Router();

router.post("/init", initCheckout);



export default router;
