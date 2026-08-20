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
      // Surfaced to the console so real fetch failures are diagnosable instead
      // of silently masked by the demo-data fallback below.
      console.warn("loadRedditData: live fetch failed, falling back to demo data:", err);

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

/**
 * Thunk: Parse Reddit listing JSON pasted in manually (e.g. copied from a
 * browser tab navigated directly to https://www.reddit.com/r/{subreddit}.json)
 * and run it through the same analysis pipeline as a live fetch. This exists
 * because a page's own fetch() to reddit.com is blocked by CORS even though a
 * real browser navigation to the same URL succeeds.
 */
export function loadFromRawJSON(rawText) {
  return function (dispatch) {
    dispatch(setLoading(true));

    try {
      const json = JSON.parse(rawText);
      const posts = json.data.children.map((child) => child.data);

      dispatch(setData(posts));
      dispatch(setUsingDemoData(false));
      dispatch(setError(null));

      const results = runAnalysisPipeline(posts);
      dispatch(setResults(results));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(`Could not parse pasted data: ${err.message}`));
      dispatch(setLoading(false));
    }
  };
}
