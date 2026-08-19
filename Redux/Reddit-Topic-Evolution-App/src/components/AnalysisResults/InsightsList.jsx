export default function InsightsList({ items = [], onSelect }) {
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          onClick={() => onSelect(item.id)}
          role="button"
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}
