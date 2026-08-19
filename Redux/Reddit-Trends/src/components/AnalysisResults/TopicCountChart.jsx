export default function TopicCountChart({ data = [], onSelect }) {
  return (
    <ul>
      {data.map((item, index) => (
        <li
          key={index}
          className="stat-item"
          onClick={() => onSelect(index)}
        >
          <span>{item.topic}</span> — <span>{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
