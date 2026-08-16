import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  supplies: 100,
  distance: 0,
  days: 0,
  cash: 200
};

export const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    gather: (state) => ({
      ...state,
      supplies: state.supplies + 15,
      days: state.days + 1
    }),

    travel: (state, action) => {
      const requiredSupplies = 20 * action.payload;
      if (state.supplies < requiredSupplies) return state;

      const newSupplies = Math.max(0, state.supplies - requiredSupplies);
      return {
        ...state,
        supplies: newSupplies,
        distance: state.distance + 10 * action.payload,
        days: state.days + action.payload
      };
    },

    tippedWagon: (state) => ({
      ...state,
      supplies: Math.max(0, state.supplies - 30),
      days: state.days + 1
    }),

    sell: (state) => {
      if (state.supplies < 20) return state;
      const newSupplies = Math.max(0, state.supplies - 20);
      return {
        ...state,
        supplies: newSupplies,
        cash: state.cash + 5
      };
    },

    buy: (state) => {
      if (state.cash < 15) return state;
      return {
        ...state,
        supplies: state.supplies + 25,
        cash: Math.max(0, state.cash - 15)
      };
    },

    theft: (state) => ({
      ...state,
      cash: Math.max(0, state.cash * 0.5)
    }),

    reset: () => initialState
  }
});

export const { gather, travel, tippedWagon, theft, buy, sell, reset } = journeySlice.actions;
export default journeySlice.reducer;