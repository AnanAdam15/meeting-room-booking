import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.get('/:id/dependencies', authenticate, authorize('admin'), userController.getUserDependencies);
router.patch('/:id/deactivate', authenticate, authorize('admin'), userController.deactivateUser);
router.patch('/:id/activate', authenticate, authorize('admin'), userController.activateUser);

export default router;