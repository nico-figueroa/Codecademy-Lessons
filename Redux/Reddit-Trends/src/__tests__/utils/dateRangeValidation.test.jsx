import validateDateRange from "../../utils/dateRangeValidation";

test("returns false when end date is before start date", () => {
  const valid = validateDateRange("2024-02-01", "2024-01-01");

  expect(valid).toBe(false);
});
