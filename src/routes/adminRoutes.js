import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminStats,
  getUsers,
  updateUserAdmin
} from '../controllers/adminController.js';
import { 
  validateUUID,
  validatePagination
} from '../utils/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', getAdminStats);

router.get('/users', validatePagination, getUsers);
router.patch('/users/:id/admin', validateUUID('id'), updateUserAdmin);

router.post('/quizzes', createQuiz);
router.patch('/quizzes/:id', validateUUID('id'), updateQuiz);
router.delete('/quizzes/:id', validateUUID('id'), deleteQuiz);

router.post('/categories', createCategory);
router.patch('/categories/:id', validateUUID('id'), updateCategory);
router.delete('/categories/:id', validateUUID('id'), deleteCategory);

export default router;