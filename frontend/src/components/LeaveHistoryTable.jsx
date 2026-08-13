import StatusBadge from './StatusBadge.jsx';
import { formatDate, calculateDaysBetween } from '../utils/date-utils.js';
import { ArrowUpDown, ArrowUp, ArrowDown, CalendarRange, Eye } from 'lucide-react';

const LeaveHistoryTable = ({
  leaves,
  showEmployee = false,
  renderActions,
  onRowClick,
  sortConfig,
  onSort,
}) => {
  const visibleLeaves = showEmployee
    ? leaves.filter((leave) => leave.user !== null && leave.user !== undefined)
    : leaves;

  if (visibleLeaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded border border-dashed border-slate-100 bg-white p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-50 text-slate-400">
          <CalendarRange className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xs font-bold text-slate-900">No leaves found</h3>
        <p className="mt-1 text-3xs text-slate-400 max-w-xs">
          There are no leave records to display under this selection.
        </p>
      </div>
    );
  }

  const renderSortIcon = (key) => {
    if (!onSort) return null;
    
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const handleSortClick = (key) => {
    if (onSort) onSort(key);
  };

  const getHeaderClass = (key) =>
    `px-4 py-3 text-left text-3xs font-bold uppercase tracking-wider text-slate-400 select-none group cursor-pointer hover:text-slate-900 transition-colors`;

  return (
    <div className="overflow-hidden rounded border border-slate-100 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {showEmployee && (
                <th className={getHeaderClass('user.name')} onClick={() => handleSortClick('user.name')}>
                  <div className="flex items-center">Employee {renderSortIcon('user.name')}</div>
                </th>
              )}
              <th className={getHeaderClass('leaveType')} onClick={() => handleSortClick('leaveType')}>
                <div className="flex items-center">Leave Type {renderSortIcon('leaveType')}</div>
              </th>
              <th className={getHeaderClass('startDate')} onClick={() => handleSortClick('startDate')}>
                <div className="flex items-center">Dates {renderSortIcon('startDate')}</div>
              </th>
              <th className={getHeaderClass('days')} onClick={() => handleSortClick('days')}>
                <div className="flex items-center">Days {renderSortIcon('days')}</div>
              </th>
              <th className="px-4 py-3 text-left text-3xs font-bold uppercase tracking-wider text-slate-400">
                Reason
              </th>
              <th className={getHeaderClass('status')} onClick={() => handleSortClick('status')}>
                <div className="flex items-center">Status {renderSortIcon('status')}</div>
              </th>
              {(renderActions || onRowClick) && (
                <th className="px-4 py-3 text-left text-3xs font-bold uppercase tracking-wider text-slate-400 w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleLeaves.map((leave) => (
              <tr
                key={leave._id}
                onClick={() => onRowClick?.(leave)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50/40' : ''
                }`}
              >
                {showEmployee && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 leading-none mb-1 truncate max-w-xs text-xs">
                        {leave.user?.name || '—'}
                      </div>
                      <div className="text-3xs text-slate-450 leading-none truncate max-w-xs">
                        {leave.user?.email || ''}
                      </div>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900 text-xs">
                  {leave.leaveType}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-550 text-xs">
                  {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900 text-xs">
                  {calculateDaysBetween(leave.startDate, leave.endDate)}
                </td>
                <td className="px-4 py-3 text-slate-550 text-xs max-w-xs truncate" title={leave.reason}>
                  {leave.reason}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={leave.status} />
                </td>
                {(renderActions || onRowClick) && (
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {renderActions ? renderActions(leave) : null}
                      {onRowClick && (
                        <button
                          onClick={() => onRowClick(leave)}
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveHistoryTable;
