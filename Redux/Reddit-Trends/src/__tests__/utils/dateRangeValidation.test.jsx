import validateDateRange from "../../utils/dateRangeValidation";

test("returns false when end date is before start date", () => {
  const valid = validateDateRange("2024-02-01", "2024-01-01");

  expect(valid).toBe(false);
});

test("returns true for a valid ascending date range", () => {
  expect(validateDateRange("2024-01-01", "2024-02-01")).toBe(true);
});

test("returns false when start and end are equal", () => {
  expect(validateDateRange("2024-01-01", "2024-01-01")).toBe(false);
});

test("returns false for unparsable dates", () => {
  expect(validateDateRange("not-a-date", "2024-01-01")).toBe(false);
});

test("supports UTC-seconds timestamps", () => {
  expect(validateDateRange(1700000000, 1700001000)).toBe(true);
  expect(validateDateRange(1700001000, 1700000000)).toBe(false);
});
