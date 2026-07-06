// Returns a random DNA base, reviewed in Task 2
const returnRandBase = () => {
  const dnaBases = ['A', 'T', 'C', 'G'];
  return dnaBases[Math.floor(Math.random() * 4)];
};

// Returns a random single stand of DNA containing 15 bases, reviewed in Task 2
const mockUpStrand = () => {
  const newStrand = [];
  for (let i = 0; i < 15; i++) {
    newStrand.push(returnRandBase());
  }
  return newStrand;
};

/* Task 3a: Factory function that returns an object containing the properties `specimenNum` and `dna`. */

function pAequorFactory(number, array) { 
  return {
    specimenNum: number,
    dna: array,
    mutate() { // Task 4 include a mutation method that randomly replaces one DNA base in the array
      let randomIndex = Math.floor(Math.random() * this.dna.length);
      let newBase = returnRandBase();
      while (this.dna[randomIndex] === newBase) {
        newBase = returnRandBase();
      }
      this.dna[randomIndex] = newBase;
      return this.dna;  
    },
    compareDNA(otherOrganism) { // Task 5 include a method that displays the percentage of DNA shared by two organisms
      let matchCount = 0;
      for (let i = 0; i < this.dna.length; i++) {
        if (this.dna[i] === otherOrganism.dna[i]) {
          matchCount++;
        }        
      }
      const percentage = (matchCount / this.dna.length) * 100;
      //console.log(`specimen #${this.specimenNum} and specimen #${otherOrganism.specimenNum} have ${percentage.toFixed(2)}% DNA in common.`);
      return percentage;
    },
    willLikelySurvive() { // Task 6 check if the organism is likely to survive based on its DNA being 60% or more 'C' or 'G' bases
      const cAndGCount = this.dna.filter(base => base === 'C' || base === 'G').length;
      return (cAndGCount / this.dna.length) >= 0.6;
    },
    complementStrand() { // Task 8a create a complementary strand of DNA
      const complement = {
        'A': 'T',
        'T': 'A',
        'C': 'G',
        'G': 'C'
      };
      return this.dna.map(base => complement[base]);
    }
  }
}

let newOrganismCount = 0;
let survivingOrganisms = [];

while (newOrganismCount < 30) { // Task 7 create 30 instances of pAequor that are likely to survive
  const newOrganism = pAequorFactory(newOrganismCount, mockUpStrand());
  if (newOrganism.willLikelySurvive()) {
    survivingOrganisms.push(newOrganism);
    newOrganismCount++;
  }
}

console.log(survivingOrganisms);

let mostRelatedOrganisms = []; // Task 8b identify the two organisms that have the highest percentage of DNA in common and display their specimen numbers and DNA strands 
let currentPercentage = 0;
let highestPercentage = 0;

for (let i = 0; i < survivingOrganisms.length; i++) {
  for (let j = i + 1; j < survivingOrganisms.length; j++) {
    currentPercentage = survivingOrganisms[i].compareDNA(survivingOrganisms[j]);
    if (currentPercentage > highestPercentage) {
      highestPercentage = currentPercentage;
      mostRelatedOrganisms = [[survivingOrganisms[i], survivingOrganisms[j]]];
    } 
  }
}

console.log(`The most related organisms are specimen #${mostRelatedOrganisms[0][0].specimenNum} and specimen #${mostRelatedOrganisms[0][1].specimenNum} with ${highestPercentage.toFixed(2)}% DNA in common.`);
console.log(`Specimen #${mostRelatedOrganisms[0][0].specimenNum} DNA: ${mostRelatedOrganisms[0][0].dna}`);
console.log(`Specimen #${mostRelatedOrganisms[0][1].specimenNum} DNA: ${mostRelatedOrganisms[0][1].dna}`);


