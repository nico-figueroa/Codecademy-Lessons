import extractKeywords from "./extractKeywords";

// Normalizes raw Reddit API posts and derives a "topic" per post from its
// most prominent keyword (real Reddit posts have no topic field of their own).
export default function transformRedditData(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map(post => {
    const text = `${post.title || ""} ${post.selftext || ""}`;
    const keywords = extractKeywords(text);
    const topic = keywords[0] || post.subreddit || "unknown";

    return {
      id: post.id,
      title: post.title,
      selftext: post.selftext,
      score: post.score ?? 0,
      created_utc: post.created_utc,
      author: post.author,
      subreddit: post.subreddit,
      keywords,
      topic
    };
  });
}
