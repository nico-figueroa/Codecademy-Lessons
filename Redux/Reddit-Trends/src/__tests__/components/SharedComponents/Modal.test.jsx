import { render, screen } from "@testing-library/react";
import Modal from "../../../components/SharedComponents/Modal";

test("does not render children when closed", () => {
  render(<Modal open={false}>Hidden Content</Modal>);

  expect(screen.queryByText(/hidden content/i)).toBeNull();
});
