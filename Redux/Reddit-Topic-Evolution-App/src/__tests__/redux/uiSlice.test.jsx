import uiReducer, { setView, openModal, closeModal } from "../../redux/uiSlice";

test("changes current view", () => {
  const initial = { currentView: "form" };

  const result = uiReducer(initial, setView("results"));

  expect(result.currentView).toBe("results");
});

test("opens and closes modal", () => {
  const initial = { modalOpen: false };

  const opened = uiReducer(initial, openModal());
  expect(opened.modalOpen).toBe(true);

  const closed = uiReducer(opened, closeModal());
  expect(closed.modalOpen).toBe(false);
});
