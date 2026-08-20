// Converts camelCase keys (e.g. "totalPosts") into readable labels ("Total Posts")
const humanize = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());

const DescriptiveStatisticsList = ({ statistics }) => {
  if (!statistics || Object.keys(statistics).length === 0) {
    return <div>No statistics available.</div>;
  }

  return (
    <ul className="stats-list">
      {Object.entries(statistics).map(([key, value]) => (
        <li className="stat-item" key={key}>
          {humanize(key)}: {String(value)}
        </li>
      ))}
    </ul>
  );
};

export default DescriptiveStatisticsList;
