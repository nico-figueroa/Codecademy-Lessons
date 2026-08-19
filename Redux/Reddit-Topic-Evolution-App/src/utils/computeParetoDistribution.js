export default function computeParetoDistribution(data) {
  // Minimal implementation to satisfy the test
  const total = data.reduce((sum, item) => sum + item.count, 0);

  let cumulative = 0;

  return data.map(item => {
    cumulative += item.count;
    return {
      ...item,
      cumulativePercent: (cumulative / total) * 100
    };
  });
}
