export default function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div>
      <label>
        Start Date
        <input
          type="date"
          value={startDate}
          onChange={e => onChange("startDate", e.target.value)}
        />
      </label>

      <label>
        End Date
        <input
          type="date"
          value={endDate}
          onChange={e => onChange("endDate", e.target.value)}
        />
      </label>
    </div>
  );
}
