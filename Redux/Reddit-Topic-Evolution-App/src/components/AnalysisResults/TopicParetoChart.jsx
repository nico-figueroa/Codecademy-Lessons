export default function TopicParetoChart({ data = [] }) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{item.topic}</li>
      ))}
    </ul>
  );
}
