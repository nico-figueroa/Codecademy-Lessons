import { selectCurrentView, selectModalOpen } from "../../redux/selectors/uiSelectors";

test("selects current view", () => {
  const state = {
    ui: { currentView: "results" }
  };

  expect(selectCurrentView(state)).toBe("results");
});

test("selects modal open state", () => {
  const state = {
    ui: { modalOpen: true }
  };

  expect(selectModalOpen(state)).toBe(true);
});
