// Selenium's sendKeys is unreliable for native <input type="date"> across
// locales/browsers, so set the value directly and dispatch the events React needs.
async function setDateInputValue(driver, elementId, dateStr) {
  await driver.executeScript(
    (id, value) => {
      const input = document.getElementById(id);
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeSetter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    elementId,
    dateStr
  );
}

function toDateInputValue(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

module.exports = { setDateInputValue, toDateInputValue };
