export default function computeParetoDistribution(data) {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Normalize input to { name, count }
  const normalized = data.map((item, index) => ({
    name:
      item.name ??
      item.topic ??
      item.label ??
      `Item ${index + 1}`,
    count: item.count ?? item.value ?? item.frequency ?? 0
  }));

  const total = normalized.reduce((sum, item) => sum + item.count, 0) || 1;

  // Sort descending by count
  const sorted = normalized.sort((a, b) => b.count - a.count);

  let cumulative = 0;

  return sorted.map((item) => {
    const percentage = (item.count / total) * 100;
    cumulative += percentage;

    return {
      name: item.name,
      percentage: Number(percentage.toFixed(2)),
      cumulativePercent: Number(cumulative.toFixed(2))
    };
  });
}
