// The keys and notes variables store the piano keys
const keys = ['c-key', 'd-key', 'e-key', 'f-key', 'g-key', 'a-key', 'b-key', 'high-c-key', 'c-sharp-key', 'd-sharp-key', 'f-sharp-key', 'g-sharp-key', 'a-sharp-key'];
const notes = [];
keys.forEach(function(key){
  notes.push(document.getElementById(key));
})

// Write named functions that change the color of the keys below
function keyPlay(event) { // Task 1
  switch (event.target.id) {
    case 'c-key':
      event.target.style.backgroundColor = 'cyan';
      break;
    case 'd-key':
      event.target.style.backgroundColor = 'deepskyblue';
      break;
    case 'e-key':
      event.target.style.backgroundColor = 'teal';
      break;
    case 'f-key':
      event.target.style.backgroundColor = 'fuchsia';
      break;
    case 'g-key':
      event.target.style.backgroundColor = 'green';
      break;
    case 'a-key':
      event.target.style.backgroundColor = 'aqua';
      break;
    case 'b-key':
      event.target.style.backgroundColor = 'blue';
      break;
    case 'high-c-key':
      event.target.style.backgroundColor = 'chocolate';
      break;
    case 'c-sharp-key':
      event.target.style.backgroundColor = 'cornflowerblue';
      break;
    case 'd-sharp-key':
      event.target.style.backgroundColor = 'darkgreen';
      break;
    case 'f-sharp-key':
      event.target.style.backgroundColor = 'firebrick';
      break;
    case 'g-sharp-key':
      event.target.style.backgroundColor = 'grey';
      break;
    case 'a-sharp-key':
      event.target.style.backgroundColor = 'aquamarine';
      break;
  }
}

function keyReturn(event) { // Task 2
  event.target.style.backgroundColor = '';
}

// Write a named function with event handler properties
function keyEventAssign(note) { // Task 3
  note.addEventListener('mousedown', keyPlay) // Task 4
  note.addEventListener('mouseup', keyReturn) // Task 5
};


// Write a loop that runs the array elements through the function
notes.forEach(keyEventAssign); // Task 6

// These variables store the buttons that progress the user through the lyrics
let nextOne = document.getElementById('first-next-line');
let nextTwo = document.getElementById('second-next-line');
let nextThree = document.getElementById('third-next-line');
let startOver = document.getElementById('fourth-next-line');

// This variable stores the '-END' lyric element
let lastLyric = document.getElementById('column-optional');

// These statements are "hiding" all the progress buttons, but the first one
nextTwo.hidden = true;
nextThree.hidden = true;
startOver.hidden= true;

// Write anonymous event handler property and function for the first progress button
nextOne.onclick = function() { // Task 8
  nextTwo.hidden = false; // Task 9
  nextOne.hidden = true;
  document.getElementById('letter-note-five').innerHTML = 'D'; // Task 10
  document.getElementById('letter-note-six').innerHTML = 'C';
}

// Write anonymous event handler property and function for the second progress button
nextTwo.onclick = function() { // Task 11
  nextThree.hidden = false; // Task 12
  nextTwo.hidden = true;
  document.getElementById('word-five').innerHTML = 'DEAR'; // Task 13
  document.getElementById('word-six').innerHTML = 'FRI-';
  lastLyric.style.display = 'inline-block'; // Task 14
  document.getElementById('letter-note-three').innerHTML = 'G'; // Task 15
  document.getElementById('letter-note-four').innerHTML = 'E';
  document.getElementById('letter-note-five').innerHTML = 'C';
  document.getElementById('letter-note-six').innerHTML = 'B';
}

// Write anonymous event handler property and function for the third progress button
nextThree.onclick = function() { // Task 16
  startOver.hidden = false; // Task 17
  nextThree.hidden = true;
  document.getElementById('word-one').innerHTML = 'HAP-'; // Task 18
  document.getElementById('word-two').innerHTML = 'PY';
  document.getElementById('word-three').innerHTML = 'BIRTH-';
  document.getElementById('word-four').innerHTML = 'DAY';
  document.getElementById('word-five').innerHTML = 'TO';
  document.getElementById('word-six').innerHTML = 'YOU!';
  document.getElementById('letter-note-one').innerHTML = 'F'; // Task 19
  document.getElementById('letter-note-two').innerHTML = 'F';
  document.getElementById('letter-note-three').innerHTML = 'E';
  document.getElementById('letter-note-four').innerHTML = 'C';
  document.getElementById('letter-note-five').innerHTML = 'D';
  document.getElementById('letter-note-six').innerHTML = 'C';
  lastLyric.style.display = 'none'; // Task 20
}

// This is the event handler property and function for the startOver button
startOver.onclick = function() {
  nextOne.hidden = false;
  startOver.hidden = true;
   document.getElementById('word-one').innerHTML = 'HAP-';
  document.getElementById('letter-note-one').innerHTML = 'G';
  document.getElementById('word-two').innerHTML = 'PY';
  document.getElementById('letter-note-two').innerHTML = 'G';
  document.getElementById('word-three').innerHTML = 'BIRTH-';
  document.getElementById('letter-note-three').innerHTML = 'A';
  document.getElementById('word-four').innerHTML = 'DAY';
  document.getElementById('letter-note-four').innerHTML = 'G';
  document.getElementById('word-five').innerHTML = 'TO';
  document.getElementById('letter-note-five').innerHTML = 'C';
  document.getElementById('word-six').innerHTML = 'YOU!';
  document.getElementById('letter-note-six').innerHTML = 'B';
}