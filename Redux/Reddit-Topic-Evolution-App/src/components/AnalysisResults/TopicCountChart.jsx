export default function TopicCountChart({ data = [] }) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>
          <span>{item.topic}</span> — <span>{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
