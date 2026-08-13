export const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

export const calculateDaysBetween = (startDate, endDate) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.round((end - start) / msPerDay) + 1;
};
