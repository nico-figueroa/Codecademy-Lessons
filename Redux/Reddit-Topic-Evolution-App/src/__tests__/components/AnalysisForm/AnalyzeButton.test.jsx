import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyzeButton from "../../../components/AnalysisForm/AnalyzeButton";

test("calls onClick when Analyze button is pressed", async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();

  render(<AnalyzeButton onClick={handleClick} />);

  const button = screen.getByRole("button", { name: /analyze/i });
  await user.click(button);

  expect(handleClick).toHaveBeenCalled();
});
