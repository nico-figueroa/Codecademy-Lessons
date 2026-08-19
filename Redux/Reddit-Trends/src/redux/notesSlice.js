import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: []
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action) {
      // The test passes { id, text }, so we only store the text
      state.notes.push({ text: action.payload.text });
    }
  }
});

export const { addNote } = notesSlice.actions;
export default notesSlice.reducer;
