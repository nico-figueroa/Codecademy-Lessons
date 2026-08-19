export default function ResultsHeader({ startDate, endDate, analysisType }) {
  return (
    <header>
      <div>{startDate}</div>
      <div>{endDate}</div>
      <h2>{analysisType}</h2>
    </header>
  );
}
