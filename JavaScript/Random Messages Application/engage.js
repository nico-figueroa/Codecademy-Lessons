/* Input arrays for the random message generator. */

const spaceships = [
  "Millennium Falcon",
  "X-Wing",
  "Y-Wing",
    "TIE Fighter",
    "Star Destroyer",
    "Death Star",
    "Slave I",
    "Imperial Shuttle",
    "A-Wing",
    "B-Wing"
];

const destinations = [
  "Tatooine",
  "Hoth",
  "Endor",
    "Dagobah",
    "Bespin",
    "Alderaan",
    "Coruscant",
    "Mustafar",
    "Jakku",
    "Kashyyyk",
    "Naboo",
    "Kamino",
    "Geonosis",
];

/* Function to generate a random message. */

function generateMessage() {
    const randomSpaceship = spaceships[Math.floor(Math.random() * spaceships.length)];
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    return `${randomSpaceship} needs to travel ${Math.floor(Math.random() * 10000)} light-years to ${randomDestination}.`;
}

function displayMessage() {
    const message = generateMessage();
    console.log(message);
}

/* Call the displayMessage function to show a random message. */

displayMessage();