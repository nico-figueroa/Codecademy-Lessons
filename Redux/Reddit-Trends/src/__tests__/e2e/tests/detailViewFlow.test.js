import { By, until } from "selenium-webdriver";
const { setDateInputValue, toDateInputValue } = require("../config/dateInputHelper");

test("User can open detailed analysis view", async () => {
  await driver.get("http://localhost:5173");

  await driver.wait(async () => {
    const options = await driver.findElements(By.css("#subreddit-select option"));
    return options.length > 1;
  }, 10000);

  const subredditSelect = await driver.findElement(By.id("subreddit-select"));
  await subredditSelect.sendKeys("javascript");

  const now = Math.floor(Date.now() / 1000);
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60;

  await setDateInputValue(driver, "start-date", toDateInputValue(fiveYearsAgo));
  await setDateInputValue(driver, "end-date", toDateInputValue(now));
  await (await driver.findElement(By.id("analyze-btn"))).click();

  await driver.wait(until.elementLocated(By.css(".result-item")), 15000);

  const item = await driver.findElement(By.css(".result-item"));
  await item.click();

  await driver.wait(until.urlContains("/details/"), 5000);
  await driver.wait(until.elementLocated(By.id("detailed-chart")), 10000);
});
