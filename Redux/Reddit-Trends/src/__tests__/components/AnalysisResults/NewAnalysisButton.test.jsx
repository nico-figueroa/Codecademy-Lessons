import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewAnalysisButton from "../../../components/AnalysisResults/ResultsActions/NewAnalysisButton";

test("calls onClick when New Analysis button is pressed", async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();

  render(<NewAnalysisButton onClick={handleClick} />);

  const button = screen.getByRole("button", { name: /new analysis/i });
  await user.click(button);

  expect(handleClick).toHaveBeenCalled();
});
