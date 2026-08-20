export default function computeTopicCounts(topics) {
  if (!Array.isArray(topics)) return {};

  const counts = {};

  topics.forEach((t) => {
    // support both plain strings and objects
    const name =
      typeof t === "string"
        ? t
        : typeof t.name === "string"
        ? t.name
        : typeof t.topic === "string"
        ? t.topic
        : null;

    if (!name) return;

    counts[name] = (counts[name] || 0) + 1;
  });

  return counts;
}
