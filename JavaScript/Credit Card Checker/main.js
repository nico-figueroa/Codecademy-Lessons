// All valid credit card numbers
const valid1 = [4, 5, 3, 9, 6, 7, 7, 9, 0, 8, 0, 1, 6, 8, 0, 8]
const valid2 = [5, 5, 3, 5, 7, 6, 6, 7, 6, 8, 7, 5, 1, 4, 3, 9]
const valid3 = [3, 7, 1, 6, 1, 2, 0, 1, 9, 9, 8, 5, 2, 3, 6]
const valid4 = [6, 0, 1, 1, 1, 4, 4, 3, 4, 0, 6, 8, 2, 9, 0, 5]
const valid5 = [4, 5, 3, 9, 4, 0, 4, 9, 6, 7, 8, 6, 9, 6, 6, 6]

// All invalid credit card numbers
const invalid1 = [4, 5, 3, 2, 7, 7, 8, 7, 7, 1, 0, 9, 1, 7, 9, 5]
const invalid2 = [5, 7, 9, 5, 5, 9, 3, 3, 9, 2, 1, 3, 4, 6, 4, 3]
const invalid3 = [3, 7, 5, 7, 9, 6, 0, 8, 4, 4, 5, 9, 9, 1, 4]
const invalid4 = [6, 0, 1, 1, 1, 2, 7, 9, 6, 1, 7, 7, 7, 9, 3, 5]
const invalid5 = [5, 3, 8, 2, 0, 1, 9, 7, 7, 2, 8, 8, 3, 8, 5, 4]

// Can be either valid or invalid
const mystery1 = [3, 4, 4, 8, 0, 1, 9, 6, 8, 3, 0, 5, 4, 1, 4]
const mystery2 = [5, 4, 6, 6, 1, 0, 0, 8, 6, 1, 6, 2, 0, 2, 3, 9]
const mystery3 = [6, 0, 1, 1, 3, 7, 7, 0, 2, 0, 9, 6, 2, 6, 5, 6, 2, 0, 3]
const mystery4 = [4, 9, 2, 9, 8, 7, 7, 1, 6, 9, 2, 1, 7, 0, 9, 3]
const mystery5 = [4, 9, 1, 3, 5, 4, 0, 4, 6, 3, 0, 7, 2, 5, 2, 3]

// An array of all the arrays above
const batch = [valid1, valid2, valid3, valid4, valid5, invalid1, invalid2, invalid3, invalid4, invalid5, mystery1, mystery2, mystery3, mystery4, mystery5]


// Add your functions below:

function validateCred(array) { // Task 3 
  let sum = 0;
  let double = false;

  for (let i = array.length - 1; i >= 0; i--) {
    let digit = array[i];

    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    double = !double;
    } 
   
    return sum % 10 === 0;

}

function findInvalidCards(cards) { // Task 4
  const invalidCards = [];

  for (let i = 0; i < cards.length; i++) {
    if (!validateCred(cards[i])) {
      invalidCards.push(cards[i]);
    }
  }

  return invalidCards;
}

function idInvalidCardCompanies(invalidCards) { // Task 5
  const companies = [];

  for (let i = 0; i < invalidCards.length; i++) {
    const firstDigit = invalidCards[i][0];

    switch (firstDigit) {
      case 3:
        if (!companies.includes('Amex')) {
          companies.push('Amex');
        }
        break;
      case 4:
        if (!companies.includes('Visa')) {
          companies.push('Visa');
        }
        break;
      case 5:
        if (!companies.includes('Mastercard')) {
          companies.push('Mastercard');
        }
        break;
      case 6:
        if (!companies.includes('Discover')) {
          companies.push('Discover');
        }
        break;
      default:
        console.log('Company not found');
    }
  }

  return companies;
}

function convertToArray(cardNumber) { // Task 7
  return cardNumber.split('').map(Number);
}

function convertToValid(invalidCardNumber) { // Task 7
  const validCardNumber = [];

  for (let i = 0; i < invalidCardNumber.length; i++) {
    let digit = invalidCardNumber[i];

    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    validCardNumber.push(digit); 
  } 

  return validCardNumber;
}

// Example usage: Task 6
const invalidCards = findInvalidCards(batch);
console.log('Invalid Cards:', invalidCards);

const companies = idInvalidCardCompanies(invalidCards);
console.log('Companies with Invalid Cards:', companies);

// Fake credit card numbers for testing
// VISA
const fakeString1 = 4024007120377824
const fakeString2 = 4485577981176020
const fakeString3 = 4789473409365355556
// MasterCard
const fakeString4 = 2720997225386616
const fakeString5 = 2720991167238141
const fakeString6 = 5499665857731431
// American Express (AMEX)
const fakeString7 = 349809745669113
const fakeString8 = 344707429642775
const fakeString9 = 372487943027879
// Discover
const fakeString10 = 6011750000042881
const fakeString11 = 6011269284166423
const fakeString12 = 6011512727122883077
// JCB
const fakeString13 = 3536303666352963
const fakeString14 = 3542657369261652
const fakeString15 = 3538597950850917668
// Diners Club - North America
const fakeString16 = 5458916829372955
const fakeString17 = 5421318030829408
// Diners Club - Carte Blanche
const fakeString18 = 30187962616040
const fakeString19 = 30266827348245
const fakeString20 = 30014705263536
// Diners Club - International
const fakeString21 = 36132248439290
const fakeString22 = 36682086450338
const fakeString23 = 36525856465384
// Maestro
const fakeString24 = 0604058401747488
const fakeString25 = 5038348308859519
const fakeString26 = 5020709556199488
// Visa Electron
const fakeString27 = 4175009276485697
const fakeString28 = 4844898990194606
const fakeString29 = 4917524687727902
// InstaPayment
const fakeString30 = 6389997043453690
const fakeString31 = 6391345860259798
const fakeString32 = 6388200090088829

const newBatch = [];

const convertFakeStrings = () => {
    for (let i = 1; i <= 32; i++) {
        const fakeStringId = 'fakeString' + i;
        const fakeStringValue = eval(fakeStringId);
        const fakeArray = convertToArray(fakeStringValue.toString());
        newBatch.push(fakeArray);
    }   
}

convertFakeStrings();

// console.log('New Batch:', newBatch);

const newInvalidCards = findInvalidCards(newBatch);
console.log('New Invalid Cards:', newInvalidCards);

const newCompanies = idInvalidCardCompanies(newInvalidCards);
console.log('New Companies with Invalid Cards:', newCompanies);