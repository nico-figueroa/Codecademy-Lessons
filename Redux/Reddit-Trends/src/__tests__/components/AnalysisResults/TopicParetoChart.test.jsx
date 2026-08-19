import { render, screen } from "@testing-library/react";
import TopicParetoChart from "../../../components/AnalysisResults/TopicParetoChart";

test("renders top topics from data", () => {
  const fakeData = [
    { topic: "AI", count: 120 },
    { topic: "Gaming", count: 90 }
  ];

  render(<TopicParetoChart data={fakeData} />);

  expect(screen.getByText("AI")).toBeInTheDocument();
  expect(screen.getByText("Gaming")).toBeInTheDocument();
});
