export const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    startDate: today.toISOString().split('T')[0],
    endDate: tomorrow.toISOString().split('T')[0],
  };
};

