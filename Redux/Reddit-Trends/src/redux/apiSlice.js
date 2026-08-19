import { createSlice } from "@reduxjs/toolkit";
import { getAccessToken } from "./redditAuth";

const initialState = {
  loading: false,
  error: null,
  data: null,
  usingDemoData: false
};

const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setData(state, action) {
      state.data = action.payload;
    },
    setUsingDemoData(state, action) {
      state.usingDemoData = action.payload;
    }
  }
});

// Explicitly name the reducer to avoid Jest module resolution issues
export const apiReducer = apiSlice.reducer;

// Named exports for actions
export const { setLoading, setError, setData, setUsingDemoData } = apiSlice.actions;

// Default export must be the named reducer
export default apiReducer;

/**
 * Fetch Reddit posts from a subreddit and filter them by date range.
 * This is a pure function and does not interact with Redux directly.
 */
export async function fetchRedditData(subreddit, { start, end }) {
  const token = await getAccessToken();

  // Routed through the Vite dev proxy (see vite.config.js) to reach
  // oauth.reddit.com, which requires the Authorization header below.
  const url = `/reddit-oauth-api/r/${subreddit}/top.json?limit=100`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const json = await response.json();

  const posts = json.data.children.map(child => child.data);

  // Filter by date range
  return posts.filter(
    post => post.created_utc >= start && post.created_utc <= end
  );
}
