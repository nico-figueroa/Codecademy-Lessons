import computeTopicCounts from "../utils/computeTopicCounts";
import computeParetoDistribution from "../utils/computeParetoDistribution";
import extractKeywords from "../utils/extractKeywords";
import computeDescriptiveStatistics from "../utils/computeDescriptiveStatistics";
import transformRedditData from "../utils/transformRedditData";

export function runAnalysisPipeline(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return {
      topics: [],
      pareto: [],
      insights: [],
      statistics: {},
      keywords: []
    };
  }

  const normalized = transformRedditData(posts);

  const topicCounts = computeTopicCounts(normalized);
  const topics = Object.entries(topicCounts).map(([name, count]) => ({ name, count }));
  const pareto = computeParetoDistribution(topics);

  const combinedText = normalized.map((p) => `${p.title || ""} ${p.selftext || ""}`).join(" ");
  const keywords = extractKeywords(combinedText);

  const statistics = computeDescriptiveStatistics(normalized);

  const insights = normalized.map((p) => ({
    id: p.id,
    title: p.title,
    score: p.score,
    created_utc: p.created_utc,
    topic: p.topic,
    keywords: p.keywords
  }));

  return {
    topics,
    pareto,
    insights,
    statistics,
    keywords
  };
}
