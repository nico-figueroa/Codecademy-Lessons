import { By } from "selenium-webdriver";

test("Mobile layout renders correctly", async () => {
  await driver.manage().window().setRect({ width: 375, height: 812 });

  await driver.get("http://localhost:5173");

  const mobileHeader = await driver.findElement(By.id("mobile-header"));
  expect(await mobileHeader.isDisplayed()).toBe(true);
});
