import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: []
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action) {
      state.notes.push({ id: action.payload.id, text: action.payload.text });
    }
  }
});

export const { addNote } = notesSlice.actions;
export default notesSlice.reducer;
