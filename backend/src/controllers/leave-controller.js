import Leave from '../models/leave-model.js';
import User from '../models/user-model.js';

export const applyForLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Start date, end date and reason are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    return res.status(201).json({ leave });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit leave request', error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ leaves });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leave history', error: error.message });
  }
};

export const getBalance = async (req, res) => {
  try {
    const approvedLeaves = await Leave.find({ user: req.user._id, status: 'Approved' });

    const daysTaken = approvedLeaves.reduce((total, leave) => {
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.round((leave.endDate - leave.startDate) / msPerDay) + 1;
      return total + days;
    }, 0);

    const pendingCount = await Leave.countDocuments({ user: req.user._id, status: 'Pending' });

    return res.status(200).json({
      totalAllotted: req.user.leaveBalance,
      daysTaken,
      daysRemaining: Math.max(req.user.leaveBalance - daysTaken, 0),
      pendingRequests: pendingCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to compute leave balance', error: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Filter out orphan leave requests where the referenced user has been deleted
    const validLeaves = leaves.filter(leave => leave.user !== null && leave.user !== undefined);
    
    return res.status(200).json({ leaves: validLeaves });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();

    return res.status(200).json({ leave });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update leave status', error: error.message });
  }
};
