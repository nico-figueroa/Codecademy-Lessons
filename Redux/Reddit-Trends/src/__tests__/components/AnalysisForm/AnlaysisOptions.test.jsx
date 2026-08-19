import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalysisOptions from "../../../components/AnalysisForm/AnalysisOptions";

test("renders options and allows selecting an option", async () => {
  const user = userEvent.setup();
  const handleChange = jest.fn();

  render(<AnalysisOptions selected={[]} onChange={handleChange} />);

  const checkbox = screen.getByLabelText(/keyword frequency/i);
  expect(checkbox).toBeInTheDocument();

  await user.click(checkbox);
  expect(handleChange).toHaveBeenCalled();
});
