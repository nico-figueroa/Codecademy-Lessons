import { render, screen } from "@testing-library/react";
import DetailedChart from "../../../components/DetailedAnalysisView/DetailedChart";

test("renders detailed chart title", () => {
  render(<DetailedChart title="AI Trend Over Time" data={[]} />);

  expect(screen.getByText(/ai trend over time/i)).toBeInTheDocument();
});
