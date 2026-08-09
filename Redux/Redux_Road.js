const initialWagonState = { // Tasks 1 and 13 bullet 1
  supplies: 100,
  distance: 0,
  days: 0, 
  cash: 200
};

const journey = (state = initialWagonState, action) => { // Task 2

  switch (action.type) { // Task 3
    case 'gather': // Task 4
      return {
        ...state, 
        supplies: state.supplies + 15, 
        days: state.days + 1
      }
    case 'travel': // Task 5
      const requiredSupplies = 20 * action.payload;
      if (state.supplies < requiredSupplies) { // Task 12
        return state;
      } else {
        return {
        ...state, 
        supplies: state.supplies - (requiredSupplies), 
        distance: state.distance + (10 * action.payload),
        days: state.days + action.payload
        }
      }
    case 'tippedWagon': // Task 6
       return {
        ...state, 
        supplies: state.supplies - 30, 
        days: state.days + 1
      }
    case 'sell': // Task 13 bullet 2
      if (state.supplies < 20) { // Task 12
        return state;
      } else {
        return {
          ...state, 
          supplies: state.supplies - 20, 
          cash: state.cash + 5
        }
      }
      
    case 'buy': // Task 13 bullet 3
      if (state.cash < 15) {
        return state;
      } else {
        return {
          ...state, 
          supplies: state.supplies + 25, 
          cash: state.cash - 15
        }
      }
    case 'theft': // Task 13 bullet 4
      return {
        ...state, 
        cash: state.cash * 0.5
      }
    default:
      return state;
  }
};

/* We play the game by calling the different actions, added also some storytelling for the user */ 
let wagon = journey( undefined , {}); // Task 7
console.log("This is how we start our journey:", wagon);
wagon = journey(wagon, {type: 'travel', payload: 1}); // Task 8
console.log("On the first day, we travel:", wagon); 
wagon = journey(wagon, {type: 'gather'}); // Task 9
console.log("On the second day, we stop to gather supplies:", wagon);
wagon = journey(wagon, {type: 'tippedWagon'}); // Task 10
console.log("On the third day, we try to ford a rushing river, and our wagon tips over, spilling some supplies:", wagon);
wagon = journey(wagon, {type: 'theft'}); 
console.log("While our wagon was tipped, we got mugged by robbers:", wagon);
wagon = journey(wagon, {type: 'travel', payload: 3}); // Task 11
console.log("On the following day, we set out for a long 3 days of travel:", wagon);
wagon = journey(wagon, {type: 'travel', payload: 3}); // Task 11
console.log("We keep pushing on the frontier by attempting to travel another 3 days:", wagon);
wagon = journey(wagon, {type: 'gather'}); 
console.log("Oh no! We ran out of supplies and we're still stuck at 40km. We had to gather supplies to continue:", wagon);
wagon = journey(wagon, {type: 'theft'}); 
console.log("While we were gathering supplies, our caravan was robbed again:", wagon);
wagon = journey(wagon, {type: 'buy'}); 
console.log("Dissapointed by the lack of progress, we go into the local pub to drink:", wagon);
wagon = journey(wagon, {type: 'buy'}); 
console.log("Meanwhile the laddies go out shopping for new dresses:", wagon);
wagon = journey(wagon, {type: 'buy'}); 
console.log("We also get some new toys for the kids:", wagon);
wagon = journey(wagon, {type: 'buy'}); 
console.log("We stay until we can no longer afford it:", wagon);
wagon = journey(wagon, {type: 'travel', payload: 3}); // Task 11
console.log("We have no choice but to press on to our destination:", wagon);

