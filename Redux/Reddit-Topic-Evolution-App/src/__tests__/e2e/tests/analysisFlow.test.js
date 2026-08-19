import { By, until } from "selenium-webdriver";

test("User can perform an analysis", async () => {
  await driver.get("http://localhost:5173");

  const startDate = await driver.findElement(By.id("start-date"));
  const endDate = await driver.findElement(By.id("end-date"));
  const analyzeBtn = await driver.findElement(By.id("analyze-btn"));

  await startDate.sendKeys("2024-01-01");
  await endDate.sendKeys("2024-01-31");
  await analyzeBtn.click();

  await driver.wait(until.elementLocated(By.id("results-header")), 10000);
});
