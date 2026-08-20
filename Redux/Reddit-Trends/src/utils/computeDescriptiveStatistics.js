export default function computeDescriptiveStatistics(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return {
      totalPosts: 0,
      uniqueTopics: 0,
      averageScore: 0,
      earliestPost: null,
      latestPost: null
    };
  }

  const totalPosts = posts.length;

  const uniqueTopics = new Set(
    posts.map((p) => p.topic || "unknown")
  ).size;

  const averageScore =
    posts.reduce((sum, p) => sum + (p.score || 0), 0) / totalPosts;

  const sortedByDate = [...posts].sort(
    (a, b) => a.created_utc - b.created_utc
  );

  return {
    totalPosts,
    uniqueTopics,
    averageScore,
    earliestPost: sortedByDate[0].created_utc,
    latestPost: sortedByDate[sortedByDate.length - 1].created_utc
  };
}
