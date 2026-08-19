import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  startDate: null,
  endDate: null,
  options: [],
  results: { topics: [] }
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
