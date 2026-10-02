import { describe, expect, it } from "vitest";
import { addressFromProfile, cleanAddress, EMPTY_ADDRESS } from "../utils/address.js";
import { ORDER_STATUSES, STATUS_STYLES } from "../utils/orderStatus.js";

describe("address utils", () => {
  it("builds a form value from a profile", () => {
    const a = addressFromProfile({ name: "A", phone: "1", address: { line1: "x", city: "c" } });
    expect(a).toMatchObject({ name: "A", phone: "1", line1: "x", city: "c", country: "US" });
  });
  it("handles a missing profile", () => {
    expect(addressFromProfile(null)).toEqual(EMPTY_ADDRESS);
  });
  it("drops blank fields", () => {
    expect(cleanAddress({ line1: "x", line2: "  ", city: "" })).toEqual({ line1: "x" });
  });
});

describe("order statuses", () => {
  it("covers every status with a style", () => {
    for (const s of ORDER_STATUSES) expect(STATUS_STYLES[s]).toBeTruthy();
  });
});
