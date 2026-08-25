const indexInput = document.getElementById('index');
const deleteButton = document.getElementById('delete-quote');
const deletedQuoteDiv = document.getElementById('deleted-quote');

deleteButton.addEventListener('click', () => {
  const index = indexInput.value;

  fetch(`/api/quotes/${index}`, {
    method: 'DELETE'
  })
  .then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to delete quote');
    return data;
  })
  .then(data => {
    deletedQuoteDiv.textContent = `Deleted Quote #${data.quote.id}: "${data.quote.quote}" by ${data.quote.person} (${data.quote.year})`;
  })
  .catch(error => {
    deletedQuoteDiv.textContent = `Error: ${error.message}`;
  });
});