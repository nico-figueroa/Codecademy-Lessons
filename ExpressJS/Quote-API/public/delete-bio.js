const deleteButton = document.getElementById('delete-bio');
const result = document.getElementById('bio-result');

deleteButton.addEventListener('click', async () => {
  const id = Number(document.getElementById('id').value);
  try {
    const response = await fetch(`/api/bios/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to delete biography');
    result.textContent = `Biography #${data.bio.id} deleted.`;
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
});
