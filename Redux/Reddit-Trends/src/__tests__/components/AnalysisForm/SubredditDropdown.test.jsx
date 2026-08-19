import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AnalysisForm from "../../../pages/AnalysisForm";
import subredditsReducer from "../../../redux/subredditsSlice";
import analysisReducer from "../../../redux/analysisSlice";
import apiReducer from "../../../redux/apiSlice";

test("renders subreddit dropdown with options", () => {
  const store = configureStore({
    reducer: {
      subreddits: subredditsReducer,
      analysis: analysisReducer,
      api: apiReducer
    },
    preloadedState: {
      subreddits: { list: ["reactjs", "javascript"] },
      analysis: { results: {} },
      api: { loading: false, error: null }
    }
  });

  const { getByLabelText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <AnalysisForm />
      </MemoryRouter>
    </Provider>
  );

  const select = getByLabelText(/subreddit/i);
  expect(select).toBeInTheDocument();
});
