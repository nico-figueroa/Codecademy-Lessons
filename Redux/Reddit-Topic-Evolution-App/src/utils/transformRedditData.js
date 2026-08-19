export default function transformRedditData(raw) {
  const counts = {};

  raw.forEach(post => {
    const topic = post.topic;
    counts[topic] = (counts[topic] || 0) + 1;
  });

  return {
    topics: Object.entries(counts).map(([topic, count]) => ({
      topic,
      count
    }))
  };
}
