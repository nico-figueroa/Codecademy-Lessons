import { createSlice } from "@reduxjs/toolkit";
import { setLoading, setError, setData, setUsingDemoData, fetchRedditData } from "./apiSlice";
import { runAnalysisPipeline } from "../analysis/analysisPipeline";
import { generateMockPosts } from "../data/mockRedditPosts";

const initialState = {
  startDate: null,
  endDate: null,
  options: [],
  results: {
    topics: [],
    pareto: [],
    insights: [],
    statistics: {},
    keywords: []
  }
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setDateRange(state, action) {
      state.startDate = action.payload.start;
      state.endDate = action.payload.end;
    },
    setOptions(state, action) {
      state.options = action.payload;
    },
    setResults(state, action) {
      state.results = action.payload;
    }
  }
});

export const { setDateRange, setOptions, setResults } = analysisSlice.actions;
export default analysisSlice.reducer;

/**
 * Thunk: Fetch Reddit data, run analysis pipeline, store results.
 * Falls back to bundled demo data if the live API is unreachable (common on
 * networks/environments where Reddit blocks unauthenticated/automated traffic)
 * so the app always remains usable and demonstrable.
 */
export function loadRedditData(subreddit, dateRange) {
  return async function (dispatch) {
    dispatch(setLoading(true));

    try {
      // 1. Fetch raw posts
      const posts = await fetchRedditData(subreddit, dateRange);
      dispatch(setData(posts));
      dispatch(setUsingDemoData(false));
      dispatch(setError(null));

      // 2. Run full analysis pipeline
      const results = runAnalysisPipeline(posts);

      // 3. Store transformed results
      dispatch(setResults(results));

      dispatch(setLoading(false));
    } catch (err) {
      const demoPosts = generateMockPosts(subreddit, dateRange);
      dispatch(setData(demoPosts));
      dispatch(setUsingDemoData(true));
      dispatch(setError(null));

      const results = runAnalysisPipeline(demoPosts);
      dispatch(setResults(results));

      dispatch(setLoading(false));
    }
  };
}
