import { selectResults, selectDateRange } from "../../redux/selectors/analysisSelectors";

test("selects date range from state", () => {
  const state = {
    analysis: { startDate: "2024-01-01", endDate: "2024-01-31" }
  };

  const result = selectDateRange(state);
  expect(result).toEqual({
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  });
});

test("selects results from state", () => {
  const state = {
    analysis: { results: { topics: [] } }
  };

  expect(selectResults(state)).toEqual({ topics: [] });
});
