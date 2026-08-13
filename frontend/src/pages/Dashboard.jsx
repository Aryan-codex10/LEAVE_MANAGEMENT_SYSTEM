import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LeaveBalanceCard from '../components/LeaveBalanceCard.jsx';
import LeaveHistoryTable from '../components/LeaveHistoryTable.jsx';
import RequestDetailModal from '../components/RequestDetailModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getLeaveBalance, getMyLeaveHistory } from '../services/leave-service.js';
import { CalendarPlus, History } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [balanceData, historyData] = await Promise.all([
          getLeaveBalance(),
          getMyLeaveHistory(),
        ]);
        setBalance(balanceData);
        setRecentLeaves(historyData.leaves.slice(0, 3));
      } catch (err) {
        setError('Could not load your dashboard summaries. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleRowClick = (leave) => {
    setSelectedRequest(leave);
    setIsModalOpen(true);
  };

  const RenderSkeletons = () => (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded bg-slate-100" />
        ))}
      </div>
      <div className="rounded bg-white border border-slate-100 p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-slate-100" />
        <div className="h-4 w-96 rounded bg-slate-100" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-slate-50" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Aryan'}
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-550">
            Manage your time-off requests and view your current leave balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/apply"
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Apply Leave</span>
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-2 rounded border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-555 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>View History</span>
          </Link>
        </div>
      </div>

      {isLoading && <RenderSkeletons />}

      {error && (
        <div className="rounded bg-danger-light border border-danger/10 p-4 text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {balance && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveBalanceCard
                label="Total Allotted"
                value={`${balance.totalAllotted} days`}
                accent="text-primary"
              />
              <LeaveBalanceCard
                label="Days Taken"
                value={`${balance.daysTaken} days`}
                accent="text-slate-900"
                total={balance.totalAllotted}
                current={balance.daysTaken}
              />
              <LeaveBalanceCard
                label="Days Remaining"
                value={`${balance.daysRemaining} days`}
                accent="text-success"
                total={balance.totalAllotted}
                current={balance.daysRemaining}
              />
              <LeaveBalanceCard
                label="Pending Requests"
                value={balance.pendingRequests}
                accent="text-warning"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Recent Request Log
                </h2>
                <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your most recent leave submissions and status updates.
                </p>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                View all requests
              </Link>
            </div>

            <LeaveHistoryTable leaves={recentLeaves} onRowClick={handleRowClick} />
          </div>
        </>
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

export default Dashboard;
