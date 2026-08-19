import analysisReducer, { setDateRange, setOptions, setResults } from "../../redux/analysisSlice";

test("sets date range", () => {
  const initial = { startDate: null, endDate: null };

  const result = analysisReducer(initial, setDateRange({ start: "2024-01-01", end: "2024-01-31" }));

  expect(result.startDate).toBe("2024-01-01");
  expect(result.endDate).toBe("2024-01-31");
});

test("sets analysis options", () => {
  const initial = { options: [] };

  const result = analysisReducer(initial, setOptions(["keywords"]));

  expect(result.options).toEqual(["keywords"]);
});
