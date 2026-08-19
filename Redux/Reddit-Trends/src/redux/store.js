import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import notesReducer from "./notesSlice";
import analysisReducer from "./analysisSlice";
import apiReducer from "./apiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    notes: notesReducer,
    analysis: analysisReducer,
    api: apiReducer
  }
});
