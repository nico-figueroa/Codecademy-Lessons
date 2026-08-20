import extractKeywords from "../../utils/extractTrendwords";

test("extracts keywords from text", () => {
  const text = "AI is transforming everything";

  const result = extractKeywords(text);

  expect(result).toContain("AI");
});
