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
    "B-Wing",
    "Executor",
    "Nebulon-B Frigate",
    "Mon Calamari Cruiser",
    "Jedi Starfighter",
    "V-Wing",
    "ARC-170",
    "TIE Interceptor",
    "TIE Bomber",
    "TIE Defender",
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
    "Utapau",
    "Dantooine",
    "Felucia",
    "Crait",
    "Ahch-To",
    "Exegol",
    "Scarif",
    "Yavin 4",
    "Lothal",
    "Mandalore",
    "Ryloth",
];

/* Functions to generate and display messages. */

function spaceshipMessages() {
    let messageArray = [];
    for (let ship of spaceships) {
        const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
        const message = `${ship} needs to travel ${Math.floor(Math.random() * 10000)} light-years to ${randomDestination}.`;
        messageArray.push(message);
    }
    return messageArray;
}
  
function displayMessage() {
      const messages = spaceshipMessages();
      messages.forEach(message => console.log(message));
}

/* Call the displayMessage function to show the messages and operate as a standalone script. */

displayMessage();