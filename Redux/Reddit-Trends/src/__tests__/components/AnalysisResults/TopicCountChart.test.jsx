import { render, screen } from "@testing-library/react";
import TopicCountChart from "../../../components/AnalysisResults/TopicCountChart";

test("renders topic counts from data", () => {
  const fakeData = [
    { name: "AI", count: 120 },
    { name: "Gaming", count: 90 }
  ];

  render(<TopicCountChart data={fakeData} />);

  expect(screen.getByText("AI", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("Gaming", { exact: false })).toBeInTheDocument();
});
