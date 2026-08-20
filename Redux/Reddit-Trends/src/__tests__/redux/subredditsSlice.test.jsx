import { configureStore } from "@reduxjs/toolkit";
import subredditsReducer, {
  setLoading,
  setError,
  setSubreddits,
  loadSubreddits
} from "../../redux/subredditsSlice";

import * as api from "../../redux/subredditsSlice";

// Mock fetch
global.fetch = jest.fn();

describe("subredditsSlice", () => {
  function createTestStore() {
    return configureStore({
      reducer: {
        subreddits: subredditsReducer
      }
    });
  }

  test("sets loading state", () => {
    const store = createTestStore();

    store.dispatch(setLoading(true));
    expect(store.getState().subreddits.loading).toBe(true);
  });

  test("sets error state", () => {
    const store = createTestStore();

    store.dispatch(setError("Network error"));
    expect(store.getState().subreddits.error).toBe("Network error");
  });

  test("sets subreddit list", () => {
    const store = createTestStore();

    store.dispatch(setSubreddits(["technology", "science"]));
    expect(store.getState().subreddits.list).toEqual(["technology", "science"]);
  });

  test("loadSubreddits fetches and stores subreddit list", async () => {
    const store = createTestStore();

    const mockResponse = {
      data: {
        children: [
          { data: { display_name: "technology" } },
          { data: { display_name: "science" } }
        ]
      }
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    await store.dispatch(loadSubreddits());

    const state = store.getState().subreddits;

    expect(state.loading).toBe(false);
    expect(state.list).toEqual(["technology", "science"]);
    expect(state.error).toBe(null);
  });

  test("loadSubreddits handles fetch error", async () => {
    const store = createTestStore();

    fetch.mockResolvedValue({
      ok: false
    });

    await store.dispatch(loadSubreddits());

    const state = store.getState().subreddits;

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to load subreddits");
  });
});
