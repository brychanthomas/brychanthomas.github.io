interface Document {
  [gauges: string]: any;
}

function calculateProbability(fraction:number, numPeople:number) {
  return 1 - ((1-fraction) ** numPeople);
}

function calculateFractionIll(population:number, daily_cases:number, length:number) {
  var ill = daily_cases * length;
  return ill / population;
}

function getInputs() {
  var population_input = document.getElementById("population");
  var population = Number((<HTMLInputElement>population_input).value);
  var weekly_cases_input = document.getElementById("cases-per-week");
  var weekly_cases = Number((<HTMLInputElement>weekly_cases_input).value);
  var daily_cases = weekly_cases / 7;
  var length_input = document.getElementById("length");
  var symptoms_length = Number((<HTMLInputElement>length_input).value);
  var asymptomatic_input = document.getElementById("asymptomatic");
  var asymptomatic_frac = Number((<HTMLInputElement>asymptomatic_input).value) / 100;
  var gathering_input = document.getElementById("gathering-size");
  var gathering_size = Number((<HTMLInputElement>gathering_input).value);
  return [population, daily_cases, symptoms_length,
    asymptomatic_frac, gathering_size];
}

function updateGauges() {
  var [population, daily, length, asymptomatic, gathering] = getInputs();
  var ill_frac = calculateFractionIll(population, daily, length);
  if (isNaN(ill_frac) || isNaN(gathering)) { return; }
  var probability = calculateProbability(ill_frac, gathering);
  var asymptom_probability = calculateProbability(ill_frac*asymptomatic, gathering);
  document.gauges[0].value = probability * 100;
  document.gauges[1].value = asymptom_probability * 100;
  document.getElementById("output-p").innerHTML =
  `${(ill_frac*100).toFixed(4)}% of the population is currently ill.<br>
  There is a ${(probability*100).toFixed(2)}% chance that at least one person has Covid-19.<br>
  There is a ${(asymptom_probability*100).toFixed(2)}% probability that at least one person is
  an asymptomatic carrier.`
}

function changeInputMethod() {
  if ((<HTMLInputElement>document.getElementById("cases-per-week-radio")).checked) {
    var elements = document.getElementsByClassName("per-week-inputs");
    for (var i = 0; i < elements.length; i++) {
      (<HTMLElement>elements[i]).style.display = "inline-block";
    }
    elements = document.getElementsByClassName("active-cases-inputs");
    for (var i = 0; i < elements.length; i++) {
      (<HTMLElement>elements[i]).style.display = "none";
    }
  }
  else {
    var elements = document.getElementsByClassName("per-week-inputs");
    for (var i = 0; i < elements.length; i++) {
      (<HTMLElement>elements[i]).style.display = "none";
    }
    elements = document.getElementsByClassName("active-cases-inputs");
    for (var i = 0; i < elements.length; i++) {
      (<HTMLElement>elements[i]).style.display = "inline-block";
    }
  }
}
