import { render, screen } from "@testing-library/react";
import DescriptiveStatisticsList from "../../../components/AnalysisResults/DescriptiveStatisticsList";

test("renders statistics items", () => {
  const stats = {
    totalPosts: 200,
    uniqueTopics: 45
  };

  render(<DescriptiveStatisticsList statistics={stats} />);

  expect(screen.getByText(/total posts/i)).toBeInTheDocument();
  expect(screen.getByText(/unique topics/i)).toBeInTheDocument();
});
