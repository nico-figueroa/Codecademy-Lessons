import { By, until } from "selenium-webdriver";

test("User can open detailed analysis view", async () => {
  await driver.get("http://localhost:5173/results");

  const item = await driver.findElement(By.css(".stat-item"));
  await item.click();

  await driver.wait(until.elementLocated(By.id("detailed-chart")), 10000);
});
