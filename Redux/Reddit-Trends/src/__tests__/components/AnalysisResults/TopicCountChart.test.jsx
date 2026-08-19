import { render, screen } from "@testing-library/react";
import TopicCountChart from "../../../components/AnalysisResults/TopicCountChart";

test("renders topic counts from data", () => {
  const fakeData = [
    { topic: "AI", count: 120 },
    { topic: "Gaming", count: 90 }
  ];

  render(<TopicCountChart data={fakeData} />);

  expect(screen.getByText("AI")).toBeInTheDocument();
  expect(screen.getByText("Gaming")).toBeInTheDocument();
});
