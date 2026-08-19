import { By, until } from "selenium-webdriver";
const { setDateInputValue, toDateInputValue } = require("../config/dateInputHelper");

test("User sees demo data when the live subreddit fetch fails", async () => {
  await driver.get("http://localhost:5173");

  // Inject a subreddit option that does not exist so the real fetch fails,
  // triggering the app's bundled-demo-data fallback (see loadRedditData thunk).
  await driver.executeScript(`
    const select = document.getElementById("subreddit-select");
    const option = document.createElement("option");
    option.value = "thisSubredditShouldNotExist12345";
    option.text = "thisSubredditShouldNotExist12345";
    select.appendChild(option);
  `);

  const subredditSelect = await driver.findElement(By.id("subreddit-select"));
  await subredditSelect.sendKeys("thisSubredditShouldNotExist12345");

  const now = Math.floor(Date.now() / 1000);
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60;

  await setDateInputValue(driver, "start-date", toDateInputValue(fiveYearsAgo));
  await setDateInputValue(driver, "end-date", toDateInputValue(now));
  await (await driver.findElement(By.id("analyze-btn"))).click();

  const banner = await driver.wait(until.elementLocated(By.id("demo-data-banner")), 15000);
  await driver.wait(until.elementIsVisible(banner), 5000);

  await driver.wait(until.elementLocated(By.id("results-header")), 5000);
});

