import { selectNotes } from "../../redux/selectors/noteSelectors";

test("selects notes from state", () => {
  const state = {
    notes: { notes: [{ id: 1, text: "Interesting trend" }] }
  };

  expect(selectNotes(state).length).toBe(1);
});
