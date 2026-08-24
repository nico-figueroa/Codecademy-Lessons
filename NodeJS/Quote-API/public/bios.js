
/* Script to handle fetching and displaying biographies from the Biographies API */
const bioContainer = document.getElementById('bio-container');
const fetchBiosButton = document.getElementById('fetch-bios');
const showAllBiosButton = document.getElementById('show-all-bios');
const fetchRandomBioButton = document.getElementById('fetch-random-bio');

const renderBios = bios => {
  bioContainer.innerHTML = '';
  if (!bios.length) {
    bioContainer.textContent = 'No biographies found.';
    return;
  }

  bios.forEach(bio => {
    /* Create an article element to hold the biography details */
    const article = document.createElement('article');
    const id = document.createElement('small');
    id.textContent = `Biography ID: ${bio.id}`;
    const heading = document.createElement('h2');
    heading.textContent = bio.person;
    const birthYear = document.createElement('p');
    birthYear.textContent = `Born: ${bio.birthYear}`;
    const description = document.createElement('p');
    description.textContent = bio.bio;
    article.append(id, heading, birthYear, description);
    bioContainer.appendChild(article);
  });
};

const loadBios = () => {
  const person = document.getElementById('bio-person').value.trim();
  const query = person ? `?person=${encodeURIComponent(person)}` : '';
  fetch(`/api/bios${query}`)
    .then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load biographies');
      return data.bios;
    })
    .then(renderBios)
    .catch(error => {
      bioContainer.textContent = `Error: ${error.message}`;
    });
};

fetchBiosButton.addEventListener('click', loadBios);
showAllBiosButton.addEventListener('click', () => {
  document.getElementById('bio-person').value = '';
  loadBios();
});

fetchRandomBioButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/bios/random');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load biography');
    renderBios([data.bio]);
  } catch (error) {
    bioContainer.textContent = `Error: ${error.message}`;
  }
});
