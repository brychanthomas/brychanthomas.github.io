import readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function calculateProbability(fraction:number, numPeople:number) {
  return 1 - ((1-fraction) ** numPeople);
}


const CASES_PER_DAY = 4 / 7;
const SYMPTOMS_LENGTH = 10;
const POPULATION = 479000;
const ASYMPTOMATIC = 0.3;

rl.question("How many people will be at the gathering? ", function(answer) {
  var numPeople:number = Number(answer);
  var peopleSickAtGivenTime:number = CASES_PER_DAY * SYMPTOMS_LENGTH;
  var fractionSick:number = peopleSickAtGivenTime / POPULATION;
  console.log(fractionSick*100+"% of people are ill.");
  console.log(fractionSick*numPeople+" people are likely to be ill at gathering.");
  var totalProbability = Math.round(calculateProbability(fractionSick, numPeople)*100000)/100000;
  console.log("There is a "+totalProbability*100+"% chance at least 1 person is ill.");
  totalProbability = Math.round(calculateProbability(fractionSick*ASYMPTOMATIC, numPeople)*100000)/100000;
  console.log("There is a "+totalProbability*100+"% chance at least 1 person is asymptomatic.");

  rl.close();
});
