import { jest } from "@jest/globals";
import shippoClient, { ShippoError } from "../utils/shippoClient.js";

const ADDRESS = {
  name: "Test",
  line1: "1 Main St",
  city: "Town",
  state: "WA",
  postalCode: "98000",
  country: "US",
};

const realFetch = global.fetch;
const realKey = process.env.SHIPPO_API_KEY;

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe("Shippo error messages", () => {
  beforeEach(() => {
    process.env.SHIPPO_API_KEY = "shippo_test_dummy";
  });

  afterEach(() => {
    global.fetch = realFetch;
    if (realKey === undefined) delete process.env.SHIPPO_API_KEY;
    else process.env.SHIPPO_API_KEY = realKey;
  });

  test("a carrier label failure exposes Shippo's readable text", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ object_id: "s1", rates: [{ amount: "5", object_id: "r1", provider: "USPS" }] }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: "ERROR",
          messages: [{ code: "failed_address_validation", text: "Recipient address invalid: Invalid ZIP code." }],
        }),
      );

    const err = await shippoClient.createLabel(ADDRESS).catch((e) => e);
    expect(err).toBeInstanceOf(ShippoError);
    expect(err.userMessage).toBe("Recipient address invalid: Invalid ZIP code.");
  });

  test("an HTTP error from Shippo is turned into a readable message", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: "Invalid token." }, false, 401));

    const err = await shippoClient.createLabel(ADDRESS).catch((e) => e);
    expect(err.userMessage).toBe("Invalid token.");
  });
});
