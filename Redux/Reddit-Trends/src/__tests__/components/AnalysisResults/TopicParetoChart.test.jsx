import { render, screen } from "@testing-library/react";
import TopicParetoChart from "../../../components/AnalysisResults/TopicParetoChart";

test("renders top topics from data", () => {
  const fakeData = [
    { name: "AI", percentage: 57.14, cumulativePercent: 57.14 },
    { name: "Gaming", percentage: 42.86, cumulativePercent: 100 }
  ];

  render(<TopicParetoChart data={fakeData} />);

  expect(screen.getByText("AI", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("Gaming", { exact: false })).toBeInTheDocument();
});
