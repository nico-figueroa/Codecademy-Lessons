import transformRedditData from "../../utils/transformRedditData";

test("normalizes raw Reddit posts and derives a topic per post", () => {
  const raw = [
    { id: 1, title: "AI is taking over", score: 100, created_utc: 1700000000, subreddit: "technology" },
    { id: 2, title: "Gaming trends 2024", score: 50, created_utc: 1700001000, subreddit: "gaming" }
  ];

  const result = transformRedditData(raw);

  expect(Array.isArray(result)).toBe(true);
  expect(result).toHaveLength(2);
  expect(result[0]).toMatchObject({ id: 1, title: "AI is taking over", topic: "AI" });
  expect(result[0].keywords).toContain("AI");
});

test("falls back to the subreddit name when no keywords are found", () => {
  const raw = [{ id: 3, title: "", selftext: "", subreddit: "news" }];

  const result = transformRedditData(raw);

  expect(result[0].topic).toBe("news");
});

test("returns an empty array for non-array input", () => {
  expect(transformRedditData(null)).toEqual([]);
});
