export default function DescriptiveStatisticsList({ items = [] }) {
  return (
    <ul>
      {items.map((stat, index) => (
        <li key={index}>
          <strong>{stat.label}</strong>: {stat.value}
        </li>
      ))}
    </ul>
  );
}
