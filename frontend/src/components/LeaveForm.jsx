import { useState, useEffect } from 'react';
import { submitLeaveForm, getLeaveBalance } from '../services/leave-service.js';
import { getTodayISO, calculateDaysBetween } from '../utils/date-utils.js';
import { Calendar, AlertCircle, Info, Sparkles, Check } from 'lucide-react';

/**
 * Metadata defining the supported leave types.
 */
const LEAVE_TYPES = [
  { id: 'Casual', label: 'Casual Leave' },
  { id: 'Sick', label: 'Sick Leave' },
  { id: 'Earned', label: 'Earned Leave' },
  { id: 'Unpaid', label: 'Unpaid Leave' },
];

const LeaveForm = ({ onSuccess }) => {
  
  const [form, setForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await getLeaveBalance();
        setBalance(data);
      } catch (err) {
        console.error('Failed to load balance', err);
      } finally {
        setLoadingBalance(false);
      }
    };
    loadBalance();
  }, []);

  const handleTypeSelect = (typeId) => {
    setForm((prev) => ({ ...prev, leaveType: typeId }));
    setErrors((prev) => ({ ...prev, leaveType: undefined }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    if (!form.endDate) nextErrors.endDate = 'End date is required';
    
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'End date cannot be before start date';
    }
    
    if (!form.reason.trim()) {
      nextErrors.reason = 'Please provide a reason for your leave';
    } else if (form.reason.trim().length < 5) {
      nextErrors.reason = 'Reason must be at least 5 characters long';
    } else if (form.reason.length > 500) {
      nextErrors.reason = 'Reason cannot exceed 500 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitLeaveForm(form);
      
      setForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      onSuccess?.();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit leave request';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysRequested =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? calculateDaysBetween(form.startDate, form.endDate)
      : null;

  const getBalanceImpact = () => {
    if (!balance || !daysRequested || form.leaveType === 'Unpaid') return null;

    const remaining = balance.daysRemaining;
    const postBalance = remaining - daysRequested;
    const isExceeded = postBalance < 0;

    return {
      remaining,
      postBalance: Math.max(postBalance, 0),
      isExceeded,
    };
  };

  const impact = getBalanceImpact();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label className="mb-3 block text-sm font-bold text-slate-700">Leave Type</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LEAVE_TYPES.map((type) => {
            const isSelected = form.leaveType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeSelect(type.id)}
                className={`flex items-center justify-between border px-4 py-2.5 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-black bg-slate-50'
                    : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                }`}
              >
                <span className="font-semibold text-slate-800 text-xs">{type.label}</span>
                {isSelected && <Check className="h-4 w-4 text-black flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-semibold text-slate-700">
            Start Date
          </label>
          <div className="relative">
            <input
              id="startDate"
              name="startDate"
              type="date"
              min={getTodayISO()}
              value={form.startDate}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 pl-9 text-xs focus:border-primary focus:ring-1 focus:ring-primary-light ${
                errors.startDate ? 'border-danger focus:border-danger' : 'border-slate-100 focus:border-primary'
              }`}
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.startDate && <p className="mt-1 text-3xs text-danger font-semibold">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-semibold text-slate-700">
            End Date
          </label>
          <div className="relative">
            <input
              id="endDate"
              name="endDate"
              type="date"
              min={form.startDate || getTodayISO()}
              value={form.endDate}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 pl-9 text-xs focus:border-primary focus:ring-1 focus:ring-primary-light ${
                errors.endDate ? 'border-danger focus:border-danger' : 'border-slate-100 focus:border-primary'
              }`}
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.endDate && <p className="mt-1 text-3xs text-danger font-semibold">{errors.endDate}</p>}
        </div>
      </div>

      {daysRequested && (
        <div className="rounded bg-slate-50 border border-slate-100 p-4 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center gap-2 text-slate-550">
            <Info className="h-4 w-4 text-primary" />
            <span>
              Request duration: <span className="font-bold text-slate-900">{daysRequested} day{daysRequested > 1 ? 's' : ''}</span>
            </span>
          </div>
          
          {impact && (
            <div className="border-t border-slate-100 pt-2">
              {impact.isExceeded ? (
                <div className="flex items-start gap-2 text-danger bg-danger-light p-2 border border-danger/10">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
                  <div>
                    <span className="font-bold">Insufficient Balance:</span> You are requesting {daysRequested} days but only have {impact.remaining} paid days left.
                    <p className="mt-0.5 opacity-90">Remaining days will be reviewed by HR as potential unpaid time.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-550 px-1">
                  <Sparkles className="h-4 w-4 text-success" />
                  <span>
                    Your paid leave balance will reduce from{' '}
                    <span className="font-semibold text-slate-900">{impact.remaining} days</span> to{' '}
                    <span className="font-semibold text-success">{impact.postBalance} days</span>.
                  </span>
                </div>
              )}
            </div>
          )}
          {form.leaveType === 'Unpaid' && (
            <p className="text-3xs text-slate-550 italic pl-6">
              * Unpaid leave requests do not affect your regular paid leave balance pool.
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-semibold text-slate-700">
          Reason for Leave
        </label>
        <div className="relative">
          <textarea
            id="reason"
            name="reason"
            rows={4}
            maxLength={500}
            value={form.reason}
            onChange={handleChange}
            placeholder="Please detail the reason for your time-off request..."
            className={`w-full rounded border px-3 py-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary-light ${
              errors.reason ? 'border-danger focus:border-danger' : 'border-slate-100 focus:border-primary'
            }`}
          />
          <span className="absolute bottom-3 right-3 text-3xs font-semibold text-slate-400">
            {form.reason.length}/500
          </span>
        </div>
        {errors.reason && <p className="mt-1 text-3xs text-danger font-semibold">{errors.reason}</p>}
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded bg-danger-light border border-danger/10 p-3 text-xs text-danger">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
          <p>{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Submitting Request...' : 'Submit Leave Request'}
      </button>
    </form>
  );
};

export default LeaveForm;
