const { Builder } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");

let driver;

beforeAll(async () => {
  const service = new edge.ServiceBuilder(
    "C:/Users/nomadant/Codecademy-Lessons/Testing/msedgedriver.exe"
  );

  const options = new edge.Options();
  options.addArguments("--headless=new");
  options.addArguments("--disable-gpu");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeService(service)
    .setEdgeOptions(options)
    .build();

  global.driver = driver;
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
