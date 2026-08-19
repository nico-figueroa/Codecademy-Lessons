export const selectDateRange = state => ({
  startDate: state.analysis.startDate,
  endDate: state.analysis.endDate
});

export const selectResults = state => state.analysis.results;
