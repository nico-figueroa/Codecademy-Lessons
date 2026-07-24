document.getElementById("load").addEventListener("click", () => {
  fetch("https://api.restcountries.com/countries/v5?q=costarica&pretty=1", {
    headers: {
      "Authorization": "Bearer rc_live_4c526d266c59446aab1e5f5379690e3a"
    }
  })
    .then(r => r.json())
    .then(data => {
      document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").textContent = err.toString();
    });
});