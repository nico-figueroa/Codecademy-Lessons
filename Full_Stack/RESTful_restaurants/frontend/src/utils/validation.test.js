import { validateComment, validateName } from "./validation";

test("trims valid names and rejects blank or overlong names", () => {
  expect(validateName("  Cafe Luna  ")).toEqual({ value: "Cafe Luna" });
  expect(validateName("   ").error).toMatch(/required/i);
  expect(validateName("a".repeat(101)).error).toMatch(/100 characters/i);
});

test("rejects control characters in names", () => {
  expect(validateName("Cafe\nLuna").error).toMatch(/control characters/i);
});

test("trims comments and permits an empty comment", () => {
  expect(validateComment("  Great desserts  ")).toEqual({
    value: "Great desserts",
  });
  expect(validateComment("   ")).toEqual({ value: "" });
});

test("rejects overlong comments and unsafe control characters", () => {
  expect(validateComment("a".repeat(501)).error).toMatch(/500 characters/i);
  expect(validateComment("Note\u0000")).toMatchObject({
    error: expect.stringMatching(/control characters/i),
  });
});
