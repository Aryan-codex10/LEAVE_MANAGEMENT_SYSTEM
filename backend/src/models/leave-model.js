import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Sick', 'Casual', 'Earned', 'Unpaid'],
      default: 'Casual',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'A reason for leave is required'],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    // Populated when an admin actions the request.
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

leaveSchema.virtual('daysRequested').get(function getDaysRequested() {
  const msPerDay = 1000 * 60 * 60 * 24;
  // Compute date difference in milliseconds and convert to calendar days
  return Math.round((this.endDate - this.startDate) / msPerDay) + 1;
});

leaveSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Leave', leaveSchema);
