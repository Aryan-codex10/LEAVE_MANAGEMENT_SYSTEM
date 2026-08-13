import express from 'express';
import {
  applyForLeave,
  getMyLeaves,
  getBalance,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leave-controller.js';
import { protect, adminOnly } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/', protect, applyForLeave);
router.get('/my', protect, getMyLeaves);
router.get('/balance', protect, getBalance);

router.get('/', protect, adminOnly, getAllLeaves);
router.patch('/:id/status', protect, adminOnly, updateLeaveStatus);

export default router;
