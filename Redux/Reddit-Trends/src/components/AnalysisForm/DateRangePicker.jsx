export default function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div className="date-range-picker">
      <label className="field-group">
        Start Date
        <input
          id="start-date"
          type="date"
          className="date-input"
          value={startDate}
          onChange={e => onChange("startDate", e.target.value)}
        />
      </label>

      <label className="field-group">
        End Date
        <input
          id="end-date"
          type="date"
          className="date-input"
          value={endDate}
          onChange={e => onChange("endDate", e.target.value)}
        />
      </label>
    </div>
  );
}
