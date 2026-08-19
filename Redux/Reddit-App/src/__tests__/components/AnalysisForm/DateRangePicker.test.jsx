import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateRangePicker from "../../../components/AnalysisForm/DateRangePicker";

test("renders two date inputs and calls onChange when updated", async () => {
  const user = userEvent.setup();
  const handleChange = jest.fn();

  render(<DateRangePicker startDate="" endDate="" onChange={handleChange} />);

  const startInput = screen.getByLabelText(/start date/i);
  const endInput = screen.getByLabelText(/end date/i);

  expect(startInput).toBeInTheDocument();
  expect(endInput).toBeInTheDocument();

  await user.type(startInput, "2024-01-01");
  expect(handleChange).toHaveBeenCalled();
});
