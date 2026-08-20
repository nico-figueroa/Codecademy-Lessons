import { fetchRedditData } from "../../redux/apiSlice";

beforeEach(() => {
  global.fetch = jest.fn();
});

test("fetches and normalizes Reddit data", async () => {
  const mockResponse = {
    data: {
      children: [
        { data: { id: "1", title: "Post A", created_utc: 1000 } },
        { data: { id: "2", title: "Post B", created_utc: 2000 } }
      ]
    }
  };

  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockResponse
  });

  const result = await fetchRedditData("javascript", {
    start: 0,
    end: 3000
  });

  expect(result).toEqual([
    { id: "1", title: "Post A", created_utc: 1000 },
    { id: "2", title: "Post B", created_utc: 2000 }
  ]);

  expect(fetch).toHaveBeenCalledTimes(1);
});

test("throws an error when response is not ok", async () => {
  fetch.mockResolvedValue({ ok: false });

  await expect(
    fetchRedditData("javascript", { start: 0, end: 3000 })
  ).rejects.toThrow("Network response was not ok");
});
