import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

let driver;

beforeAll(async () => {
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();

  global.driver = driver;
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
