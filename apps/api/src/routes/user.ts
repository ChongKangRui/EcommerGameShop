import {Router} from 'express';
import { login, register, updatePassword, updateUserInfo, verifyUser } from '../controllers/userController';
import { requireAuth } from 'src/middleWare/auth';

 const router = Router();


 router.post('/register', register);
 router.post('/login', login);
 router.get('/auth/verify', requireAuth, verifyUser)
router.put('/me', requireAuth, updateUserInfo)
router.put('/me/password', requireAuth, updatePassword)

export default router;
