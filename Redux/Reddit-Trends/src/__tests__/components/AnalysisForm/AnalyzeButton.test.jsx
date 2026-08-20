import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { store } from "../../../redux/store";
import AnalyzeButton from "../../../components/AnalysisForm/AnalyzeButton";

test("calls onClick when Analyze button is pressed", () => {
  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <AnalyzeButton
          selectedSubreddit="reactjs"
          startDate="1700000000"
          endDate="1700001000"
        />
      </MemoryRouter>
    </Provider>
  );

  const button = getByText(/analyze/i);
  fireEvent.click(button);
});
