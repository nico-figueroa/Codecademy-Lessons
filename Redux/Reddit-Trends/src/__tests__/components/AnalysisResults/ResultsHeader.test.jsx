import { render, screen } from "@testing-library/react";
import ResultsHeader from "../../../components/AnalysisResults/ResultsHeader";

test("renders date range and analysis title", () => {
  const props = {
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    analysisType: "Keyword Frequency"
  };

  render(<ResultsHeader {...props} />);

  expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
  expect(screen.getByText(/2024-01-31/i)).toBeInTheDocument();
  expect(screen.getByText(/keyword frequency/i)).toBeInTheDocument();
});
