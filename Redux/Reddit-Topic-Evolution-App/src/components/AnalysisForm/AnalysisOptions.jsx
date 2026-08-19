export default function AnalysisOptions({ selected = [], onChange }) {
  const options = ["Keyword Frequency", "Topic Trends", "Pareto Analysis"];

  return (
    <div>
      {options.map(opt => (
        <label key={opt}>
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
