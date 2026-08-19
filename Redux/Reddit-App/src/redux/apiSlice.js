import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  data: null
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
    }
  }
});

export const { setLoading, setError, setData } = apiSlice.actions;
export default apiSlice.reducer;
