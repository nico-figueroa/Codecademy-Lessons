const updateButton = document.getElementById('update-bio');
const result = document.getElementById('bio-result');

updateButton.addEventListener('click', async () => {
  const id = Number(document.getElementById('id').value);
  const person = document.getElementById('person').value.trim();
  const birthYear = Number(document.getElementById('birth-year').value);
  const bio = document.getElementById('bio').value.trim();
  try {
    const response = await fetch(`/api/bios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, birthYear, bio })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to update biography');
    result.textContent = `Biography #${data.bio.id} updated.`;
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
});
