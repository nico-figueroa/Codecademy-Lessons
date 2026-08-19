import { render, screen } from "@testing-library/react";
import Footer from "../../../components/Layout/Footer";

test("renders footer text", () => {
  render(<Footer />);

  expect(screen.getByText(/reddit topic evolution/i)).toBeInTheDocument();
});
