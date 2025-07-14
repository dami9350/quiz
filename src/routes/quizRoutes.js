import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  getQuizzes,
  getQuizById,
  getRandomQuiz,
  submitAnswer,
  getCategories,
  createQuiz
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/', optionalAuth, getQuizzes);
router.get('/categories', getCategories);
router.get('/random', optionalAuth, getRandomQuiz);
router.get('/:id', optionalAuth, getQuizById);
router.post('/answer', authenticate, submitAnswer);
router.post('/', authenticate, createQuiz);

export default router;