import { render, screen } from "@testing-library/react";
import ErrorMessage from "../../../components/SharedComponents/ErrorMessage";

test("renders error message text", () => {
  render(<ErrorMessage message="Something went wrong" />);

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
