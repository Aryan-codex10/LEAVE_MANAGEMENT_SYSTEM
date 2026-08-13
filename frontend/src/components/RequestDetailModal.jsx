import { X, Calendar, User, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatDate, calculateDaysBetween } from '../utils/date-utils.js';

const RequestDetailModal = ({ leave, isOpen, onClose }) => {
  if (!isOpen || !leave) return null;

  const duration = calculateDaysBetween(leave.startDate, leave.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/20 transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded bg-white p-5 shadow-xs animate-fade-in border border-slate-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-655 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-slate-900">
            {leave.leaveType}
          </span>
          <StatusBadge status={leave.status} />
        </div>

        <div className="space-y-4">
          {leave.user?.name && (
            <div className="flex items-start gap-3">
              <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Employee</p>
                <p className="text-xs font-bold text-slate-900">{leave.user.name}</p>
                <p className="text-3xs text-slate-500">{leave.user.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Requested Dates</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span>{formatDate(leave.startDate)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-450" />
                <span>{formatDate(leave.endDate)}</span>
              </div>
              <p className="text-3xs text-slate-500 font-semibold mt-0.5">
                Total duration: {duration} day{duration > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquare className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div className="w-full">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Reason for Request</p>
              <div className="mt-1 rounded bg-slate-50 border border-slate-100 p-3 text-xs text-slate-550 leading-relaxed">
                "{leave.reason}"
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
            <Clock className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Approval Lifecycle</p>
              
              {leave.status === 'Pending' ? (
                <p className="text-xs text-slate-550 mt-1 font-medium">
                  Submitted on <span className="font-semibold text-slate-700">{formatDate(leave.createdAt)}</span>. Awaiting review.
                </p>
              ) : (
                <div className="mt-1.5 space-y-2">
                  <p className="text-xs text-slate-550 font-medium">
                    Reviewed on <span className="font-semibold text-slate-700">{formatDate(leave.updatedAt)}</span>
                  </p>
                  
                  {leave.reviewedBy && (
                    <p className="text-3xs text-slate-500">
                      Actioned by Admin
                    </p>
                  )}

                  {leave.reviewNote ? (
                    <div className="rounded bg-slate-50 border border-slate-100 p-3 mt-2 text-xs text-slate-900">
                      <p className="font-bold text-3xs uppercase tracking-wider text-slate-400 mb-1">Manager Response Note</p>
                      <p className="font-medium">"{leave.reviewNote}"</p>
                    </div>
                  ) : (
                    <p className="text-3xs text-slate-400 italic">No response note was provided by the reviewer.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-555 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
