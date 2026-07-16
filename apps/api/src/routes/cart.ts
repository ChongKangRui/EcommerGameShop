import {Router} from 'express';
import { requireAuth } from 'src/middleWare/auth';
import { getGuestCartProduct, getCartItem, migrateCartItems, updateCartItem, addCartItem, deleteCartItem, validateCart } from 'src/controllers/cartController';

 const router = Router();

//router.post("/admin/addProduct", requireAuth, isAdmin);

// use post here because we need guest passing in their cart item data
router.post("/guest", getGuestCartProduct);
router.post("/migrate", requireAuth, migrateCartItems);
router.post("/me", requireAuth, addCartItem);
router.patch("/me", requireAuth, updateCartItem);
router.get("/me", requireAuth, getCartItem);
router.delete("/me/:variation_id", requireAuth, deleteCartItem)
router.get("/validate", requireAuth, validateCart)
//router.get("/:id", requireAuth, getProduct);


export default router;
