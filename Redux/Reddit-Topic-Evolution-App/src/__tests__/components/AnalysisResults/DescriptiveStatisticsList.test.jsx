import { render, screen } from "@testing-library/react";
import DescriptiveStatisticsList from "../../../components/AnalysisResults/DescriptiveStatisticsList";

test("renders statistics items", () => {
  const stats = [
    { id: 1, label: "Total Posts", value: 200 },
    { id: 2, label: "Unique Topics", value: 45 }
  ];

  render(<DescriptiveStatisticsList items={stats} />);

  expect(screen.getByText(/total posts/i)).toBeInTheDocument();
  expect(screen.getByText(/unique topics/i)).toBeInTheDocument();
});
