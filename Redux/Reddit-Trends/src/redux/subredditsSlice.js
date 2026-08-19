import { createSlice } from "@reduxjs/toolkit";
import { getAccessToken } from "./redditAuth";

// Used until (or unless) the live "popular subreddits" fetch succeeds, so the
// dropdown is never empty when Reddit's anonymous API is unavailable/blocked.
export const FALLBACK_SUBREDDITS = [
  "javascript",
  "reactjs",
  "webdev",
  "programming",
  "technology",
  "gaming",
  "AskReddit",
  "worldnews",
  "science",
  "movies"
];

const initialState = {
  loading: false,
  error: null,
  list: FALLBACK_SUBREDDITS
};

const subredditsSlice = createSlice({
  name: "subreddits",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setSubreddits(state, action) {
      state.list = action.payload;
    }
  }
});

export const { setLoading, setError, setSubreddits } = subredditsSlice.actions;
export default subredditsSlice.reducer;

/**
 * Thunk: Load popular subreddits from Reddit API
 */
export function loadSubreddits() {
  return async function (dispatch) {
    dispatch(setLoading(true));

    try {
      const token = await getAccessToken();

      // Routed through the Vite dev proxy (see vite.config.js) to reach
      // oauth.reddit.com, which requires the Authorization header below.
      const response = await fetch("/reddit-oauth-api/subreddits/popular.json", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        dispatch(setError("Failed to load subreddits"));
        dispatch(setLoading(false));
        return;
      }

      const json = await response.json();

      const names = json.data.children.map(child => child.data.display_name);

      dispatch(setSubreddits(names));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.message));
      dispatch(setLoading(false));
    }
  };
}
