const indexInput = document.getElementById('index');
const quoteInput = document.getElementById('quote');
const personInput = document.getElementById('person');
const updateButton = document.getElementById('update-quote');
const updatedQuoteDiv = document.getElementById('updated-quote');

updateButton.addEventListener('click', () => {
  const index = indexInput.value;
  const quote = quoteInput.value;
  const person = personInput.value;
  const year = Number(document.getElementById('year').value);

  fetch(`/api/quotes/${index}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quote, person, year })
  })
  .then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to update quote');
    return data;
  })
  .then(data => {
    updatedQuoteDiv.textContent = `Updated Quote: "${data.quote.quote}" by ${data.quote.person} (${data.quote.year})`;
  })
  .catch(error => {
    updatedQuoteDiv.textContent = `Error: ${error.message}`;
  });
});