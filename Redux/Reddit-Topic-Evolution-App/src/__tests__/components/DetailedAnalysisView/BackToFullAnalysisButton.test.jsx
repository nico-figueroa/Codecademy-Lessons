import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BackToFullAnalysisButton from "../../../components/DetailedAnalysisView/BackToFullAnalysisButton";

test("calls onClick when Back button is pressed", async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();

  render(<BackToFullAnalysisButton onClick={handleClick} />);

  const button = screen.getByRole("button", { name: /back to full analysis/i });
  await user.click(button);

  expect(handleClick).toHaveBeenCalled();
});
