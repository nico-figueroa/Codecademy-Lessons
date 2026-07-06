let humanScore = 0;
let computerScore = 0;
let currentRoundNumber = 1;

// Write your code below:

function generateTarget() { // Task 1
    return Math.floor(Math.random()*9);
}

function getAbsoluteDistance(number1, number2) { // Task 6
    return Math.abs(number1 - number2)
}

function compareGuesses(userGuess, computerGuess, targetNumber) { // Tasks 2 and 6
    const userDistance = getAbsoluteDistance(userGuess, targetNumber);
    const computerDistance = getAbsoluteDistance(computerGuess, targetNumber);
    if(userDistance < computerDistance) {
        return true; // True returned when human wins
    } else if (userDistance > computerDistance) {
        return false; // False returned when computer wins
    } else {
        return true; // If tied, human user should win
    }
}

function updateScore(winner) { // Task 3
    if (winner === 'human') {
        humanScore++;
    } else if (winner === 'computer') {
        computerScore++;
    }    
}

function advanceRound() { // Task 4
    currentRoundNumber++;
}