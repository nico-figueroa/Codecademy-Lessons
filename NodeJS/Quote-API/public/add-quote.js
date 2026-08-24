const submitButton = document.getElementById('submit-quote');
const newQuoteContainer = document.getElementById('new-quote');

submitButton.addEventListener('click', () => {
  const quote = document.getElementById('quote').value.trim();
  const person = document.getElementById('person').value.trim();
  const year = Number(document.getElementById('year').value);

  if (!quote || !person || quote.length > 500 || person.length > 100 ||
      !Number.isInteger(year) || year < 1 || year > new Date().getFullYear()) {
    newQuoteContainer.textContent = 'Quote, person, and a valid year are required.';
    return;
  }

  fetch('/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quote, person, year })
  })
  .then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to add quote');
    return data.quote;
  })
  .then(addedQuote => {
    const newQuote = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = 'Congrats, your quote was added!';
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = addedQuote.quote;
    const attribution = document.createElement('div');
    attribution.className = 'attribution';
    attribution.textContent = `- ${addedQuote.person}`;
    const yearText = document.createElement('div');
    yearText.textContent = `Year: ${addedQuote.year}`;
    const message = document.createElement('p');
    message.textContent = 'Go to the home page to request and view all quotes.';
    newQuote.append(heading, quoteText, attribution, yearText, message);
    newQuoteContainer.appendChild(newQuote);
  })
  .catch(error => {
    newQuoteContainer.textContent = `Error: ${error.message}`;
  });
});
