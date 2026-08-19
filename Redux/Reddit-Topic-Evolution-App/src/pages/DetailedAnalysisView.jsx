import { useParams } from "react-router-dom";

export default function DetailedAnalysisView() {
  const { id } = useParams();

  // Placeholder data — replace with real Redux data later
  const details = {
    title: `Detailed Analysis for Item ${id}`,
    description: "This section provides deeper insight into the selected topic.",
    chartData: [12, 18, 5, 9] // dummy values
  };

  return (
    <div>
      <h1>{details.title}</h1>

      <p>{details.description}</p>

      {/* Required by E2E tests */}
      <div id="detailed-chart">
        <h3>Detailed Chart</h3>
        <ul>
          {details.chartData.map((value, index) => (
            <li key={index}>Value: {value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
