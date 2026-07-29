import {Router} from 'express';
import { requireAuth } from 'src/middleWare/auth';
import { getGuestCartProduct, getCartItem, migrateCartItems, updateCartItem, addCartItem, deleteCartItem, validateCart } from 'src/controllers/cartController';
import { browsingLimiter, cartLimiter } from 'src/utils/rateLimitHelper';

 const router = Router();

//router.post("/admin/addProduct", requireAuth, cartLimiter, isAdmin);

// use post here because we need guest passing in their cart item data
router.post("/guest",cartLimiter, getGuestCartProduct);
router.post("/migrate", requireAuth, cartLimiter, migrateCartItems);
router.post("/me", requireAuth, cartLimiter, addCartItem);
router.patch("/me", requireAuth, cartLimiter, updateCartItem);
router.get("/me", requireAuth, browsingLimiter, getCartItem);
router.delete("/me/:variation_id", requireAuth, cartLimiter, deleteCartItem)
router.get("/validate", requireAuth, browsingLimiter, validateCart)


export default router;
