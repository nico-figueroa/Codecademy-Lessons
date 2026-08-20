import { createSlice } from "@reduxjs/toolkit";

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
  // Fetched directly from the browser: reddit.com's base subreddit listing
  // endpoint (unlike /top.json, or this same endpoint with sort=top/t= params)
  // allows this cross-origin fetch without a server-side proxy or CORS error.
  const url = `https://www.reddit.com/r/${subreddit}.json?limit=100`;

  const response = await fetch(url);

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
