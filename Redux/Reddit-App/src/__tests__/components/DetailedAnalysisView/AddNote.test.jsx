import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddNote from "../../../components/DetailedAnalysisView/AddNote";

test("allows user to type a note and submit it", async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();

  render(<AddNote onSubmit={handleSubmit} />);

  const input = screen.getByPlaceholderText(/add a note/i);
  await user.type(input, "Interesting trend");

  const button = screen.getByRole("button", { name: /save note/i });
  await user.click(button);

  expect(handleSubmit).toHaveBeenCalledWith("Interesting trend");
});
