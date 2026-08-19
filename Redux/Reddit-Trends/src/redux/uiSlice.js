import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentView: "form",
  modalOpen: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setView(state, action) {
      state.currentView = action.payload;
    },
    openModal(state) {
      state.modalOpen = true;
    },
    closeModal(state) {
      state.modalOpen = false;
    }
  }
});

export const { setView, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
