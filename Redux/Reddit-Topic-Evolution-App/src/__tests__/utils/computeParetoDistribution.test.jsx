import computeParetoDistribution from "../../utils/computeParetoDistribution";

test("computes cumulative percentages for Pareto chart", () => {
  const data = [
    { topic: "AI", count: 100 },
    { topic: "Gaming", count: 50 },
    { topic: "Space", count: 25 }
  ];

  const result = computeParetoDistribution(data);

  expect(result[0]).toHaveProperty("cumulativePercent");
  expect(result[0].cumulativePercent).toBeGreaterThan(0);
});
