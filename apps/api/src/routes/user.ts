import {Router} from 'express';
import { login, register, updatePassword, updateUserInfo, verifyUser } from '../controllers/userController';
import { requireAuth } from 'src/middleWare/auth';
import { authLimiter, sensitiveActionLimiter, authCheckLimiter} from 'src/utils/rateLimitHelper';

 const router = Router();


 router.post('/register', authLimiter, register);
 router.post('/login', authLimiter, login);
 router.get('/auth/verify', authCheckLimiter, requireAuth, verifyUser)

router.put('/me', sensitiveActionLimiter, requireAuth, updateUserInfo)
router.put('/me/password', sensitiveActionLimiter, requireAuth, updatePassword)

export default router;
