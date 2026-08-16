import { configureStore } from '@reduxjs/toolkit';
import { journeySlice } from './Redux_road_refactored';

export const store = configureStore({
  reducer: {
    journey: journeySlice.reducer
  }
});
