const submitButton = document.getElementById('submit-bio');
const result = document.getElementById('bio-result');

submitButton.addEventListener('click', async () => {
  const person = document.getElementById('person').value.trim();
  const birthYear = Number(document.getElementById('birth-year').value);
  const bio = document.getElementById('bio').value.trim();
  if (!person || !bio || !Number.isInteger(birthYear) || birthYear < 1 || birthYear > new Date().getFullYear()) {
    result.textContent = 'Person, biography, and a valid birth year are required.';
    return;
  }

  try {
    const response = await fetch('/api/bios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, birthYear, bio })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to add biography');
    result.textContent = `Biography #${data.bio.id} added for ${data.bio.person}.`;
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
});
