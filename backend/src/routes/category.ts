import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { 
  createCategorySchema, 
  updateCategorySchema 
} from '../schemas/solicitation';
import { UserRole } from '../types';

const router = Router();
const categoryController = new CategoryController();

router.get('/', categoryController.list);

router.use(authenticateToken);

router.post(
  '/',
  requireRole([UserRole.ADMIN]),
  validateBody(createCategorySchema),
  categoryController.create
);

router.put(
  '/:id',
  requireRole([UserRole.ADMIN]),
  validateBody(updateCategorySchema),
  categoryController.update
);

router.get('/:id', categoryController.findById);

router.delete(
  '/:id',
  requireRole([UserRole.ADMIN]),
  categoryController.delete
);

export { router as categoryRoutes };
