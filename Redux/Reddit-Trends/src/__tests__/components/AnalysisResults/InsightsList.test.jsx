import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsList from "../../../components/AnalysisResults/InsightsList";

test("renders insights and allows selecting an insight", async () => {
  const user = userEvent.setup();
  const handleSelect = jest.fn();

  const insights = [
    { id: 1, title: "AI discussions increased 40%" },
    { id: 2, title: "Gaming posts peaked on weekends" }
  ];

  render(<InsightsList insights={insights} onSelect={handleSelect} />);

  expect(screen.getByText(/AI discussions increased/i)).toBeInTheDocument();
  expect(screen.getByText(/Gaming posts peaked/i)).toBeInTheDocument();

  const firstItem = screen.getByText(/AI discussions increased/i);
  await user.click(firstItem);

  expect(handleSelect).toHaveBeenCalledWith(1);
});
