import { useEffect, useState } from 'react';
import LeaveHistoryTable from '../components/LeaveHistoryTable.jsx';
import RequestDetailModal from '../components/RequestDetailModal.jsx';
import { getAllLeaveRequests, reviewLeaveRequest } from '../services/leave-service.js';
import { Search, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const loadLeaves = async () => {
    try {
      const data = await getAllLeaveRequests();
      setLeaves(data.leaves);
    } catch (err) {
      setError('Could not load leave requests. Please try reloading.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleConfirmReview = async () => {
    if (!reviewTarget || !reviewStatus) return;

    setIsReviewing(true);
    try {
      await reviewLeaveRequest(reviewTarget._id, reviewStatus, reviewNote);

      // Update locally held list of leaves without refreshing
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === reviewTarget._id
            ? { ...leave, status: reviewStatus, reviewNote }
            : leave
        )
      );

      setReviewTarget(null);
      setReviewStatus('');
      setReviewNote('');
    } catch (err) {
      // Failed silently or handle error in UI
    } finally {
      setIsReviewing(false);
    }
  };

  // Reset page number on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const getStats = () => {
    const pending = leaves.filter((l) => l.status === 'Pending').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeToday = leaves.filter((l) => {
      if (l.status !== 'Approved') return false;
      const start = new Date(l.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.endDate);
      end.setHours(0, 0, 0, 0);
      return today >= start && today <= end;
    }).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const approvedThisMonth = leaves.filter((l) => {
      if (l.status !== 'Approved') return false;
      const start = new Date(l.startDate);
      return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
    }).length;

    return { pending, activeToday, approvedThisMonth };
  };

  const stats = getStats();

  const filteredLeaves =
    filter === 'All' ? leaves : leaves.filter((leave) => leave.status === filter);

  const searchedLeaves = filteredLeaves.filter((leave) => {
    const name = leave.user?.name?.toLowerCase() || '';
    const email = leave.user?.email?.toLowerCase() || '';
    const reason = leave.reason?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    return name.includes(query) || email.includes(query) || reason.includes(query);
  });

  const handleSort = (key) => {
    let direction = 'asc';
    
    // Toggle direction if column is clicked again
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 3. Sorting Execution: resolve ordered list using active criteria
  const sortedLeaves = [...searchedLeaves].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key.includes('.')) {
      const parts = sortConfig.key.split('.');
      valA = a[parts[0]]?.[parts[1]];
      valB = b[parts[0]]?.[parts[1]];
    }

    // Push undefined/null elements to the end of the list
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
      return sortConfig.direction === 'asc'
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }

    if (sortConfig.key === 'days') {
      const daysA = Math.round((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const daysB = Math.round((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return sortConfig.direction === 'asc' ? daysA - daysB : daysB - daysA;
    }

    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const totalItems = sortedLeaves.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedLeaves = sortedLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (leave) => {
    setSelectedRequest(leave);
    setIsDetailOpen(true);
  };

  const openReviewModal = (leave, status) => {
    setReviewTarget(leave);
    setReviewStatus(status);
    setReviewNote('');
  };

  const renderActions = (leave) => {
    if (leave.status !== 'Pending') {
      return <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider px-1">Reviewed</span>;
    }
    return (
      <div className="flex gap-1.5">
        <button
          onClick={() => openReviewModal(leave, 'Approved')}
          className="rounded border border-success/20 bg-success-light px-2 py-1 text-2xs font-bold text-success hover:bg-success hover:text-white transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => openReviewModal(leave, 'Rejected')}
          className="rounded border border-danger/20 bg-danger-light px-2 py-1 text-2xs font-bold text-danger hover:bg-danger hover:text-white transition-colors"
        >
          Reject
        </button>
      </div>
    );
  };

  const renderLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-slate-200" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Title & Headline */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Admin Review Panel
        </h1>
        <p className="mt-1 text-xs font-semibold text-slate-550">
          Moderate, approve, or decline time-off applications from employees.
        </p>
      </div>

      {isLoading && renderLoader()}

      {error && (
        <div className="rounded bg-danger-light border border-danger/10 p-4 text-xs font-semibold text-danger animate-fade-in">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col border border-slate-100 bg-white p-5 shadow-xs rounded-lg">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Pending Actions</span>
              <h3 className="font-display text-xl font-bold text-warning">{stats.pending} Request(s)</h3>
              <p className="text-3xs font-semibold text-slate-555 mt-1">Requires admin review</p>
            </div>

            <div className="flex flex-col border border-slate-100 bg-white p-5 shadow-xs rounded-lg">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Absent Today</span>
              <h3 className="font-display text-xl font-bold text-primary">{stats.activeToday} Employee(s)</h3>
              <p className="text-3xs font-semibold text-slate-555 mt-1">Currently on active leave</p>
            </div>

            <div className="flex flex-col border border-slate-100 bg-white p-5 shadow-xs rounded-lg">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Approved (This Month)</span>
              <h3 className="font-display text-xl font-bold text-success">{stats.approvedThisMonth} Leave(s)</h3>
              <p className="text-3xs font-semibold text-slate-555 mt-1">Closed this calendar month</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search employee, email, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-slate-100 px-3 py-2 pl-9 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary-light bg-white"
                />
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex gap-1 border border-slate-100 bg-slate-50 p-1 rounded">
                {['Pending', 'Approved', 'Rejected', 'All'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`rounded px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                      filter === option
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-555 hover:text-slate-900'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <LeaveHistoryTable
              leaves={paginatedLeaves}
              showEmployee
              renderActions={renderActions}
              sortConfig={sortConfig}
              onSort={handleSort}
              onRowClick={handleRowClick}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-555">
                <span>
                  Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="text-slate-900">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="text-slate-900">{totalItems}</span> requests
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded border border-slate-100 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-slate-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded border border-slate-100 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RequestDetailModal
        leave={selectedRequest}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRequest(null);
        }}
      />

      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/20 transition-opacity"
            onClick={() => setReviewTarget(null)}
          />
          <div className="relative w-full max-w-md rounded bg-white p-5 shadow-xs animate-fade-in border border-slate-100">
            <button
              onClick={() => setReviewTarget(null)}
              className="absolute right-4 top-4 rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-655"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              Review Leave Request
            </h3>
            
            <p className="text-xs text-slate-555 mb-4">
              Reviewing <strong>{reviewTarget.leaveType}</strong> for <strong>{reviewTarget.user?.name}</strong>.
            </p>

            <div className="space-y-1.5 mb-6">
              <label htmlFor="reviewNote" className="text-xs font-bold text-slate-700">
                Optional Response Note
              </label>
              <textarea
                id="reviewNote"
                rows={3}
                maxLength={200}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Provide notes or feedback regarding your decision..."
                className="w-full rounded border border-slate-100 p-2.5 text-xs font-medium placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary-light bg-white"
              />
              <span className="block text-right text-3xs font-semibold text-slate-400">
                {reviewNote.length}/200
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setReviewTarget(null)}
                disabled={isReviewing}
                className="rounded border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-555 hover:bg-slate-555/5 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              
              {reviewStatus === 'Approved' ? (
                <button
                  onClick={handleConfirmReview}
                  disabled={isReviewing}
                  className="flex items-center gap-1.5 rounded bg-success px-4 py-2 text-xs font-bold text-white hover:bg-success/90 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Approval</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmReview}
                  disabled={isReviewing}
                  className="flex items-center gap-1.5 rounded bg-danger px-4 py-2 text-xs font-bold text-white hover:bg-danger/90 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <X className="h-4 w-4" />
                  <span>Confirm Rejection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
