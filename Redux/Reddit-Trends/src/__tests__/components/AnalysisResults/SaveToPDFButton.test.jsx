import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveToPDFButton from "../../../components/AnalysisResults/ResultsActions/SaveToPDFButton";

test("calls onClick when Save to PDF button is pressed", async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();

  render(<SaveToPDFButton onClick={handleClick} />);

  const button = screen.getByRole("button", { name: /save to pdf/i });
  await user.click(button);

  expect(handleClick).toHaveBeenCalled();
});
