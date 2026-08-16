import journeySlice from './Redux_road_refactored.js';
import { gather, travel, tippedWagon, theft, buy, sell } from './Redux_road_refactored.js';

const journey = journeySlice;

/* We play the game by calling the different actions, added also some storytelling for the user */ 

let wagon = journey(undefined, {});
console.log("This is how we start our journey:", wagon);

wagon = journey(wagon, travel(1));
console.log("On the first day, we travel:", wagon);

wagon = journey(wagon, gather());
console.log("On the second day, we stop to gather supplies:", wagon);

wagon = journey(wagon, tippedWagon());
console.log("On the third day, we try to ford a rushing river, and our wagon tips over, spilling some supplies:", wagon);

wagon = journey(wagon, theft());
console.log("While our wagon was tipped, we got mugged by robbers:", wagon);

wagon = journey(wagon, travel(3));
console.log("On the following day, we set out for a long 3 days of travel:", wagon);

wagon = journey(wagon, travel(3));
console.log("We keep pushing on the frontier by attempting to travel another 3 days:", wagon);

wagon = journey(wagon, gather());
console.log("Oh no! We ran out of supplies and we're still stuck at 40km. We had to gather supplies to continue:", wagon);

wagon = journey(wagon, theft());
console.log("While we were gathering supplies, our caravan was robbed again:", wagon);

wagon = journey(wagon, buy());
console.log("Disappointed by the lack of progress, we go into the local pub to drink:", wagon);

wagon = journey(wagon, buy());
console.log("Meanwhile the laddies go out shopping for new dresses:", wagon);

wagon = journey(wagon, buy());
console.log("We also get some new toys for the kids:", wagon);

wagon = journey(wagon, buy());
console.log("We stay until we can no longer afford it:", wagon);

wagon = journey(wagon, travel(3));
console.log("We have no choice but to press on to our destination:", wagon);
