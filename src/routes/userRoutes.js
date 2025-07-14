import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProfile,
  createOrUpdateProfile,
  updateUserType
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.post('/profile', authenticate, createOrUpdateProfile);
router.patch('/user-type', authenticate, updateUserType);

export default router;