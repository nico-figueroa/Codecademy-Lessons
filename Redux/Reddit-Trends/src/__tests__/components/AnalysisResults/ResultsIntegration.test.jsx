import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AnalysisForm from "../../../pages/AnalysisForm";
import AnalysisResults from "../../../pages/AnalysisResults";
import analysisReducer from "../../../redux/analysisSlice";
import apiReducer from "../../../redux/apiSlice";
import subredditsReducer from "../../../redux/subredditsSlice";

test("integration: form and results render together", () => {
  const store = configureStore({
    reducer: {
      analysis: analysisReducer,
      api: apiReducer,
      subreddits: subredditsReducer
    },
    preloadedState: {
      analysis: {
        startDate: null,
        endDate: null,
        options: [],
        results: {
          topics: [{ name: "AI", count: 120 }],
          pareto: [{ name: "AI", percentage: 60, cumulativePercent: 60 }],
          insights: [{ id: "1", title: "AI discussions increased" }],
          statistics: { totalPosts: 10 },
          keywords: []
        }
      },
      api: { loading: false, error: null },
      subreddits: { list: ["reactjs"] }
    }
  });

  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <AnalysisForm />
        <AnalysisResults />
      </MemoryRouter>
    </Provider>
  );

  expect(getByText(/analysis form/i)).toBeInTheDocument();
  expect(getByText(/analysis results/i)).toBeInTheDocument();
});
