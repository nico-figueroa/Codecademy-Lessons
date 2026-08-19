export default function computeTopicCounts(topics) {
  const counts = {};

  topics.forEach(topic => {
    counts[topic] = (counts[topic] || 0) + 1;
  });

  return counts;
}
