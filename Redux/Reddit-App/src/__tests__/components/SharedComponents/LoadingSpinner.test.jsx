import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../../../components/SharedComponents/LoadingSpinner";

test("renders loading spinner", () => {
  render(<LoadingSpinner />);

  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
});
