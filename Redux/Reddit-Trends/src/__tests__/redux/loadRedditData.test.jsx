import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "../../redux/apiSlice";
import analysisReducer, { loadRedditData } from "../../redux/analysisSlice";
import * as apiSlice from "../../redux/apiSlice"; // import everything

// Mock ONLY the fetchRedditData function
jest.spyOn(apiSlice, "fetchRedditData");

describe("loadRedditData thunk", () => {
  function createTestStore() {
    return configureStore({
      reducer: {
        api: apiReducer,
        analysis: analysisReducer
      }
    });
  }

  test("dispatches loading, fetches data, and stores results", async () => {
    const store = createTestStore();

    apiSlice.fetchRedditData.mockResolvedValue([
      { id: "1", title: "Post A" },
      { id: "2", title: "Post B" }
    ]);

    await store.dispatch(loadRedditData("javascript", { start: 0, end: 3000 }));

    const state = store.getState().api;

    expect(state.loading).toBe(false); // loading ends after success
    expect(state.data).toEqual([
      { id: "1", title: "Post A" },
      { id: "2", title: "Post B" }
    ]);
    expect(state.error).toBe(null);
    expect(state.usingDemoData).toBe(false);
  });

  test("falls back to bundled demo data when the live fetch fails", async () => {
    const store = createTestStore();

    apiSlice.fetchRedditData.mockRejectedValue(new Error("Rate limit exceeded"));

    await store.dispatch(loadRedditData("javascript", { start: 0, end: 3000 }));

    const state = store.getState().api;

    expect(state.loading).toBe(false); // loading ends after falling back
    expect(state.error).toBe(null);
    expect(state.usingDemoData).toBe(true);
    expect(state.data.length).toBeGreaterThan(0);
  });
});
