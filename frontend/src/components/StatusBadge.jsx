const StatusBadge = ({ status }) => {
  // Render plain bold uppercase black text for modern minimal aesthetics.
  return (
    <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-900 select-none">
      {status}
    </span>
  );
};

export default StatusBadge;
