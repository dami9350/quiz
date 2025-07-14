import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserResults,
  getResultById,
  getUserStats
} from '../controllers/resultController.js';

const router = express.Router();

router.get('/', authenticate, getUserResults);
router.get('/stats', authenticate, getUserStats);
router.get('/:id', authenticate, getResultById);

export default router;