import transformRedditData from "../../utils/transformRedditData";

test("transforms raw Reddit posts into topic counts", () => {
  const raw = [
    { title: "AI is taking over", id: 1 },
    { title: "Gaming trends 2024", id: 2 }
  ];

  const result = transformRedditData(raw);

  expect(result).toHaveProperty("topics");
  expect(result.topics.length).toBeGreaterThan(0);
});
