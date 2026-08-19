import { By, until } from "selenium-webdriver";

test("User can recover from an error state", async () => {
  await driver.get("http://localhost:5173");

  const analyzeBtn = await driver.findElement(By.id("analyze-btn"));
  await analyzeBtn.click(); // triggers error

  const errorMsg = await driver.findElement(By.id("error-message"));
  await driver.wait(until.elementIsVisible(errorMsg), 5000);

  const retryBtn = await driver.findElement(By.id("retry-btn"));
  await retryBtn.click();

  await driver.wait(until.elementLocated(By.id("analysis-form")), 5000);
});
