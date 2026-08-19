import { By, until } from "selenium-webdriver";

test("User can search and filter results", async () => {
  await driver.get("http://localhost:5173/results");

  const searchInput = await driver.findElement(By.id("search-input"));
  await searchInput.sendKeys("AI");

  const filterSelect = await driver.findElement(By.id("category-filter"));
  await filterSelect.sendKeys("Technology");

  await driver.wait(until.elementLocated(By.css(".result-item")), 5000);
});
