import { render, screen } from "@testing-library/react";
import ChartContainer from "../../../components/SharedComponents/ChartContainer";

test("renders chart container with children", () => {
  render(
    <ChartContainer>
      <div>Chart Content</div>
    </ChartContainer>
  );

  expect(screen.getByText(/chart content/i)).toBeInTheDocument();
});
