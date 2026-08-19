import { render, screen } from "@testing-library/react";
import AdditionalInformation from "../../../components/DetailedAnalysisView/AdditionalInformation";

test("renders additional information text", () => {
  const info = "AI discussions increased significantly in January.";

  render(<AdditionalInformation text={info} />);

  expect(screen.getByText(/AI discussions increased/i)).toBeInTheDocument();
});
