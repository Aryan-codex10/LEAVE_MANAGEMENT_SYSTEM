const LeaveBalanceCard = ({
  label,
  value,
  accent = 'text-slate-900',
  total = 0,
  current = 0,
}) => {
  // Dynamically compute supporting information based on labels to remain backward compatible
  let supportingInfo = '';
  const l = label.toLowerCase();
  
  if (l.includes('taken') && total > 0) {
    supportingInfo = `${current} of ${total} days used`;
  } else if (l.includes('remaining') && total > 0) {
    supportingInfo = `${current} of ${total} days left`;
  } else if (l.includes('allotted') || l.includes('total')) {
    supportingInfo = 'Annual allowance';
  } else if (l.includes('pending')) {
    supportingInfo = 'Awaiting admin approval';
  }

  let colorClass = 'text-slate-900';
  if (l.includes('remaining') || accent.includes('emerald') || accent.includes('success')) {
    colorClass = 'text-success';
  } else if (l.includes('taken') || accent.includes('indigo') || accent.includes('primary')) {
    colorClass = 'text-primary';
  } else if (l.includes('pending') || accent.includes('amber') || accent.includes('warning')) {
    colorClass = 'text-warning';
  }

  return (
    <div className="flex flex-col border border-slate-100 bg-white p-5 shadow-xs rounded-lg">
      <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </span>
      <h3 className={`font-display text-xl font-bold tracking-tight ${colorClass}`}>
        {value}
      </h3>
      {supportingInfo && (
        <p className="text-3xs font-semibold text-slate-550 mt-1">
          {supportingInfo}
        </p>
      )}
    </div>
  );
};

export default LeaveBalanceCard;
