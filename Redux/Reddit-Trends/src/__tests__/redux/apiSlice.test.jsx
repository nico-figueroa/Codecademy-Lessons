import apiReducer, { setLoading, setError, setData } from "../../redux/apiSlice";

test("sets loading state", () => {
  const initial = { loading: false };

  const result = apiReducer(initial, setLoading(true));

  expect(result.loading).toBe(true);
});

test("sets error", () => {
  const initial = { error: null };

  const result = apiReducer(initial, setError("Network error"));

  expect(result.error).toBe("Network error");
});
