// Import required modules
import promptSync from 'prompt-sync';
import EventEmitter from 'events';
import chalk from 'chalk';

console.clear(); // Clear the console at the start of the game
console.log(chalk.cyan('\nWelcome to Find Your Hat!\n')); // Print a welcome message in cyan color

const prompt = promptSync({ sigint: true }); // Exit the game on Ctrl+C with any prompt call

// Define game and field characters
const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

// Define the Field class and its methods
class Field extends EventEmitter { // Extends EventEmitter to handle game events like game over (e.g., falling into a hole or finding the hat)
  constructor(field) {
    super();
    this.field = field;
  }

  // -- Start methods and game logic for the Field class --
  print() { // Print the current state of the game field to the console
    console.clear(); // clears the screen before each redraw of the game field.
    console.log(chalk.cyan('\n=== Find Your Hat ===\n')); // Print the game title in cyan color
    for (let row of this.field) {
      console.log(
        row
          .map(tile => { // map each tile to its colored representation with appropriate color
            if (tile === pathCharacter) return chalk.green(tile);
            if (tile === hat) return chalk.yellow(tile);
            if (tile === hole) return chalk.red(tile);
            return chalk.blue(tile);
          })
          .join('') // join the colored tiles into a single string for console output
      );
    }
    console.log('\nUse W A S D to move. Press Ctrl+C to quit.\n'); // Print the movement instructions in the console
  }

  static generateField(height, width, holePercentage) { // Field generator method with given dimensions and hole percentage
    const field = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => fieldCharacter)
    );

    // 1. Random hat position
    const hatRow = Math.floor(Math.random() * height);
    const hatCol = Math.floor(Math.random() * width);
    field[hatRow][hatCol] = hat;

    // 2. Random start position (not the hat)
    let startRow = Math.floor(Math.random() * height);
    let startCol = Math.floor(Math.random() * width);

    while (startRow === hatRow && startCol === hatCol) {
      startRow = Math.floor(Math.random() * height);
      startCol = Math.floor(Math.random() * width);
    }

    let row = startRow;
    let col = startCol;

    // 3. Generate a guaranteed path from the start to the hat (hidden)
    const pathTiles = new Set();
    // Add the starting position to the path tiles
    pathTiles.add(`${row},${col}`);

    // Continue moving towards the hat until the current position matches the hat's position
    while (row !== hatRow || col !== hatCol) {
      const movesToWin = []; // Possible moves that will lead towards the hat

      if (row < hatRow) movesToWin.push('down');
      if (row > hatRow) movesToWin.push('up');
      if (col < hatCol) movesToWin.push('right');
      if (col > hatCol) movesToWin.push('left');

      const steps = movesToWin[Math.floor(Math.random() * movesToWin.length)]; // Randomly select one of the possible moves towards the hat

      switch (steps) {
        case 'down': row++; break;
        case 'up': row--; break;
        case 'right': col++; break;
        case 'left': col--; break;
      }

      pathTiles.add(`${row},${col}`);
    }

    // 4. Fill remaining tiles with holes (never on path or hat)
    for (let r = 0; r < height; r++) { // Iterate over each row
      for (let c = 0; c < width; c++) { // Iterate over each column within the current row
        if (!pathTiles.has(`${r},${c}`) && field[r][c] !== hat) { // Only consider tiles that are not part of the path and not the hat
          if (Math.random() < holePercentage) { // Randomly decide whether to place a hole based on the hole percentage
            field[r][c] = hole; // Place a hole at the current position
          }
        }
      }
    }

    // 5. Draw only the starting position
    field[startRow][startCol] = pathCharacter;

    return new Field(field);
  } // End of generateField method

  isOutOfBounds(row, col) {
    return (
      row < 0 ||
      row >= this.field.length ||
      col < 0 ||
      col >= this.field[0].length
    );
  }

  isHole(row, col) {
    return this.field[row][col] === hole;
  }

  isHat(row, col) {
    return this.field[row][col] === hat;
  }

  addRandomHole() { // Add a random hole to the field (never on path or hat), method needed for hard mode implementation
    let r, c;
    while (true) {
      r = Math.floor(Math.random() * this.field.length);
      c = Math.floor(Math.random() * this.field[0].length);
      // Ensure the randomly selected tile is not part of the path or the hat before placing a hole
      if (this.field[r][c] === fieldCharacter) {
        this.field[r][c] = hole;
        break; // Exit the loop once a hole is successfully added
      }
      // If the randomly selected tile is not suitable, the loop will continue until a valid tile is found
    }
  }

  move(direction) {
    const currentRow = this.field.findIndex(row => row.includes(pathCharacter));
    const currentCol = this.field[currentRow].indexOf(pathCharacter);

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction.toLowerCase()) {
      case 'w': // up
        newRow--;
        break; // Prevent fall-through to the next case
      case 's': // down
        newRow++;
        break; // Prevent fall-through to the next case
      case 'a': // left
        newCol--;
        break; // Prevent fall-through to the next case
      case 'd': // right
        newCol++;
        break; // Prevent fall-through to the next case
      default:
        console.log('Invalid key. Use W A S D.');
        return;
    }

    if (this.isOutOfBounds(newRow, newCol)) { // Check if the new position is out of bounds by calling the isOutOfBounds method
      console.log('Out of bounds!');
      this.emit('gameOver', 'outOfBounds'); // Emit game over event for out of bounds
      return;
    }

    if (this.isHole(newRow, newCol)) { // Check if the new position is a hole by calling the isHole method
      console.log('You fell into a hole!');
      this.emit('gameOver', 'hole'); // Emit game over event for falling into a hole
      return;
    }

    if (this.isHat(newRow, newCol)) { // Check if the new position is the hat by calling the isHat method
      console.log('You found your hat!');
      this.emit('gameOver', 'hat'); // Emit game over event for finding the hat
      return;
    }

    // If all checks pass, move the path character by updating the field array with the new position
    this.field[currentRow][currentCol] = fieldCharacter; // Clear the previous position of the path character and make it a regular field tile
    this.field[newRow][newCol] = pathCharacter; // Set the new position of the path character
  }
} // End of Field class

// --- Input loop for field parameters ---
let height, width, holePercentage;

// Dynamically scale field size to fit most of the terminal window
// Reserve a small margin for title/instructions
const terminalHeight = process.stdout.rows || 24;
const terminalWidth  = process.stdout.columns || 80;

// Use ~70% of available height and ~80% of available width for the field
// Clamp to reasonable minimums so the game remains playable in small terminals
height = Math.max(5, Math.floor(terminalHeight * 0.7));
width  = Math.max(15, Math.floor(terminalWidth * 0.8));

console.log(`Auto-sized field: ${height} rows x ${width} columns\n`);

while (true) { // Loop until the user enters a valid hole percentage
  holePercentage = parseFloat(prompt('Enter hole percentage (0-35): ')); // Prompt the user to enter the hole percentage

  if (holePercentage >= 0 && holePercentage <= 35) {
    break;
  }

  console.log('Invalid input. Please enter a percentage between 0 and 35.\n');
}

// Prompt the user to enable hard mode and store the result in a constant
// The user can choose 'y' for yes or 'n' for no
const hardModeInput = prompt('Enable hard mode? (y/n): ').toLowerCase();
const HARD_MODE = hardModeInput === 'y';

// Generate the game field based on user input and print it to the console
const myField = Field.generateField(height, width, holePercentage / 100);
myField.print();

// Initialize the turn counter
let turns = 0;

// Function to handle each turn of the game based on user input
// It updates the game state, checks for hard mode events, and prints the field
let playGame = (key) => {
  const input = key.toString().trim();
  turns++;

  myField.move(input); // Call the move method to update the player's position based on the input key

  if (HARD_MODE && turns % 5 === 0) { // In hard mode, add a new random hole every 5 turns
    myField.addRandomHole();
    console.log(chalk.red('A new hole has appeared!'));
  }

  myField.print();
};

// Event listener for game over events
// This handles different game over scenarios and exits the game accordingly
myField.on('gameOver', (reason) => {
  switch (reason) {
    case 'outOfBounds':
      console.log(chalk.red('Game Over: You went out of bounds!'));
      break;
    case 'hole':
      console.log(chalk.red('Game Over: You fell into a hole!'));
      break;
    case 'hat':
      console.log(chalk.green('Congratulations! You found the hat!'));
      break;
  }
  process.exit();   // Exit the game after handling the game over scenario
});

// --- REAL-TIME KEYBOARD INPUT ---
process.stdin.setRawMode(true); // Enable raw mode for real-time keyboard input
process.stdin.resume(); // Start reading from stdin so the process does not exit
process.stdin.setEncoding('utf8'); // Set the encoding for stdin data events

process.stdin.on('data', (key) => {
  if (key === '\u0003') {  // Ctrl+C to exit the game
    process.exit();
  }
  playGame(key); // Handle the user's key input for the current turn
});

