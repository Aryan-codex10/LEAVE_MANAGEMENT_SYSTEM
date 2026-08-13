import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveForm from '../components/LeaveForm.jsx';
import { CheckCircle2, ArrowLeft, Calendar } from 'lucide-react';

const ApplyLeave = () => {
  const navigate = useNavigate();

  const [submittedData, setSubmittedData] = useState(null);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 text-sm font-semibold text-slate-555 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="rounded border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
        {submittedData ? (
          <div className="space-y-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded bg-success-light text-success border border-success/10 shadow-xs animate-fade-in">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Request Submitted Successfully
              </h2>
              <p className="text-xs font-medium text-slate-555 max-w-sm mx-auto">
                Your leave application has been submitted and is currently pending review by your manager.
              </p>
            </div>

            <div className="max-w-md mx-auto rounded border border-slate-100 bg-slate-50 p-5 text-left text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 text-3xs">
                Application Brief
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-550">Leave Category</span>
                <span className="font-bold text-slate-900">{submittedData.leaveType || 'Casual'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-550">Requested Dates</span>
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{submittedData.startDate} to {submittedData.endDate}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-555">Total Duration</span>
                <span className="font-bold text-slate-900">{submittedData.days} Day(s)</span>
              </div>
              {submittedData.reason && (
                <div className="border-t border-slate-100 pt-2.5 text-xs">
                  <span className="font-semibold text-slate-555 block mb-1">Reason Provided</span>
                  <p className="text-slate-900 italic font-medium">"{submittedData.reason}"</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => setSubmittedData(null)}
                className="rounded border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-555 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => navigate('/history')}
                className="rounded bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
              >
                Go to History
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Apply for Leave
              </h2>
              <p className="text-xs font-semibold text-slate-555 mt-1">
                Please complete the form below to register a new leave request.
              </p>
            </div>

            <hr className="border-slate-100" />

            <LeaveForm
              onSuccess={() => {
                // Fetch details from inputs inside form to preview summary
                const start = document.getElementById('startDate')?.value || '';
                const end = document.getElementById('endDate')?.value || '';
                const reasonText = document.getElementById('reason')?.value || '';

                // Retrieve the currently active selected type text
                const activeTypeBtn = document.querySelector('button[type="button"].border-black');
                const type = activeTypeBtn?.textContent || 'Casual';

                // Simple date differences for preview
                let durationDays = 1;
                if (start && end) {
                  const msPerDay = 1000 * 60 * 60 * 24;
                  durationDays = Math.round((new Date(end) - new Date(start)) / msPerDay) + 1;
                }

                // Update submission details to switch layout view
                setSubmittedData({
                  leaveType: type,
                  startDate: start,
                  endDate: end,
                  reason: reasonText,
                  days: durationDays,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyLeave;
