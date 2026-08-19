import computeTopicCounts from "../../utils/computeTopicCounts";

test("computes topic counts", () => {
  const topics = ["AI", "Gaming", "AI"];

  const result = computeTopicCounts(topics);

  expect(result.AI).toBe(2);
  expect(result.Gaming).toBe(1);
});
