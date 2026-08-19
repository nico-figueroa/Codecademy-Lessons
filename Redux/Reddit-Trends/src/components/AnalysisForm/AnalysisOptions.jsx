export default function AnalysisOptions({ selected = [], onChange }) {
  const options = ["Keyword Frequency", "Topic Trends", "Pareto Analysis"];

  return (
    <div className="analysis-options">
      {options.map(opt => (
        <label key={opt} className="option-pill">
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
