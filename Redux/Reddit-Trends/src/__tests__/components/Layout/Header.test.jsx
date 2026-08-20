import { render, screen } from "@testing-library/react";
import Header from "../../../components/Layout/Header";

test("renders header title", () => {
  render(<Header />);

  expect(screen.getByText(/reddit topic evolution/i)).toBeInTheDocument();
});
