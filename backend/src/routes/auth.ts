import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, createUserSchema, refreshSchema } from '../schemas/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', validateBody(loginSchema), authController.login.bind(authController));
router.post('/refresh', validateBody(refreshSchema), authController.refresh.bind(authController));
router.post('/logout', validateBody(refreshSchema), authController.logout.bind(authController));
router.post('/users', validateBody(createUserSchema), authController.createUser.bind(authController));
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

export { router as authRoutes };
