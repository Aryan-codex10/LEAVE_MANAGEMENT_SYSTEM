import { useEffect, useState } from 'react';
import LeaveHistoryTable from '../components/LeaveHistoryTable.jsx';
import RequestDetailModal from '../components/RequestDetailModal.jsx';
import { getMyLeaveHistory, getAllLeaveRequests } from '../services/leave-service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const LeaveHistory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState(isAdmin ? 'team' : 'my');

  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      let data;
      if (viewMode === 'team') {
        data = await getAllLeaveRequests();
      } else {
        data = await getMyLeaveHistory();
      }
      setLeaves(data.leaves || []);
    } catch (err) {
      setError('Could not load leave request records. Please reload.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [viewMode]);

  const filteredLeaves =
    filter === 'All' ? leaves : leaves.filter((leave) => leave.status === filter);

  const searchedLeaves = filteredLeaves.filter((leave) => {
    const leaveTypeMatch = leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const reasonMatch = leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const employeeNameMatch =
      viewMode === 'team' && leave.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeEmailMatch =
      viewMode === 'team' && leave.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return leaveTypeMatch || reasonMatch || employeeNameMatch || employeeEmailMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, viewMode]);

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeaves = [...searchedLeaves].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key.includes('.')) {
      const parts = sortConfig.key.split('.');
      valA = a[parts[0]]?.[parts[1]];
      valB = b[parts[0]]?.[parts[1]];
    }

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
    setIsModalOpen(true);
  };

  const renderLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="flex h-10 w-full justify-between items-center rounded bg-slate-100 px-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded bg-slate-200" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title, Headline & View toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Leave History
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-550">
            {viewMode === 'team'
              ? 'View and audit all employee leave request records.'
              : "View and audit all of your personal leave request records."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-1 border border-slate-100 bg-slate-50 p-1 rounded self-start sm:self-auto">
            <button
              onClick={() => setViewMode('team')}
              className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 rounded ${
                viewMode === 'team' ? 'bg-white text-primary shadow-xs' : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              Team History
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 rounded ${
                viewMode === 'my' ? 'bg-white text-primary shadow-xs' : 'text-slate-555 hover:text-slate-900'
              }`}
            >
              My History
            </button>
          </div>
        )}
      </div>

      {isLoading && renderLoader()}

      {error && (
        <div className="bg-danger-light border border-danger/10 p-4 text-xs font-semibold text-danger animate-fade-in">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder={
                  viewMode === 'team'
                    ? 'Search employee, email, reason...'
                    : 'Search by reason or category...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-100 rounded px-3 py-2 pl-9 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary-light bg-white"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex gap-1 border border-slate-100 bg-slate-50 p-1 rounded self-start sm:self-auto">
              {['All', 'Pending', 'Approved', 'Rejected'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`rounded px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                    filter === option ? 'bg-white text-primary shadow-xs' : 'text-slate-555 hover:text-slate-900'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <LeaveHistoryTable
            leaves={paginatedLeaves}
            showEmployee={viewMode === 'team'}
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
                  className="flex h-8 w-8 items-center justify-center border border-slate-100 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-slate-900">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center border border-slate-100 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <RequestDetailModal
        leave={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
};

export default LeaveHistory;
