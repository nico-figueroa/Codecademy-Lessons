import notesReducer, { addNote } from "../../redux/notesSlice";

test("adds a note", () => {
  const initial = { notes: [] };

  const result = notesReducer(initial, addNote({ id: 1, text: "Interesting trend" }));

  expect(result.notes.length).toBe(1);
  expect(result.notes[0].text).toBe("Interesting trend");
});
