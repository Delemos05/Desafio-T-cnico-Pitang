import { Router } from 'express';
import { SolicitationController } from '../controllers/solicitationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { 
  createSolicitationSchema, 
  updateSolicitationSchema,
  approveRejectSchema 
} from '../schemas/solicitation';
import { UserRole } from '../types';

const router = Router();
const solicitationController = new SolicitationController();

router.use(authenticateToken);

router.post(
  '/', 
  validateBody(createSolicitationSchema),
  solicitationController.create
);

router.get('/', solicitationController.list);

router.get('/:id', solicitationController.findById);

router.put(
  '/:id',
  validateBody(updateSolicitationSchema),
  solicitationController.update
);

router.post('/:id/submit', solicitationController.submit);

router.post(
  '/:id/approve',
  requireRole([UserRole.MANAGER]),
  validateBody(approveRejectSchema),
  solicitationController.approve
);

router.post(
  '/:id/reject',
  requireRole([UserRole.MANAGER]),
  validateBody(approveRejectSchema),
  solicitationController.reject
);

router.post(
  '/:id/pay',
  requireRole([UserRole.FINANCE]),
  solicitationController.pay
);

router.post('/:id/cancel', solicitationController.cancel);

router.get('/:id/history', solicitationController.getHistory);

export { router as solicitationRoutes };
