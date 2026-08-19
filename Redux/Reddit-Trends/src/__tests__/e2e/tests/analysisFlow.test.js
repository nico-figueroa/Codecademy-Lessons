import { By, until } from "selenium-webdriver";
const { setDateInputValue, toDateInputValue } = require("../config/dateInputHelper");

test("User can perform an analysis", async () => {
  await driver.get("http://localhost:5173");

  // Wait for the subreddits list to finish loading before selecting one
  await driver.wait(async () => {
    const options = await driver.findElements(By.css("#subreddit-select option"));
    return options.length > 1;
  }, 10000);

  // Select a real subreddit
  const subredditSelect = await driver.findElement(By.id("subreddit-select"));
  await subredditSelect.sendKeys("javascript");

  const analyzeBtn = await driver.findElement(By.id("analyze-btn"));

  // Use a wide, relative window (all-time "top" posts are usually old, so this
  // avoids depending on a specific hardcoded historical date range).
  const now = Math.floor(Date.now() / 1000);
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60;

  await setDateInputValue(driver, "start-date", toDateInputValue(fiveYearsAgo));
  await setDateInputValue(driver, "end-date", toDateInputValue(now));

  await analyzeBtn.click();

  await driver.wait(until.urlContains("/results"), 10000);

  await driver.wait(until.elementLocated(By.id("results-header")), 15000);
});
