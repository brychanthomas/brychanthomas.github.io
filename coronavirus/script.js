function calculateProbability(fraction, numPeople) {
    return 1 - (Math.pow((1 - fraction), numPeople));
}
function calculateFractionIll(population, daily_cases, length) {
    var ill = daily_cases * length;
    return ill / population;
}
function getInputs() {
    var population_input = document.getElementById("population");
    var population = Number(population_input.value);
    var weekly_cases_input = document.getElementById("cases-per-week");
    var weekly_cases = Number(weekly_cases_input.value);
    var daily_cases = weekly_cases / 7;
    var length_input = document.getElementById("length");
    var symptoms_length = Number(length_input.value);
    var asymptomatic_input = document.getElementById("asymptomatic");
    var asymptomatic_frac = Number(asymptomatic_input.value) / 100;
    var gathering_input = document.getElementById("gathering-size");
    var gathering_size = Number(gathering_input.value);
    return [population, daily_cases, symptoms_length,
        asymptomatic_frac, gathering_size];
}
function updateGauges() {
    var _a = getInputs(), population = _a[0], daily = _a[1], length = _a[2], asymptomatic = _a[3], gathering = _a[4];
    var ill_frac = calculateFractionIll(population, daily, length);
    if (isNaN(ill_frac) || isNaN(gathering)) {
        return;
    }
    var probability = calculateProbability(ill_frac, gathering);
    var asymptom_probability = calculateProbability(ill_frac * asymptomatic, gathering);
    document.gauges[0].value = probability * 100;
    document.gauges[1].value = asymptom_probability * 100;
    document.getElementById("output-p").innerHTML =
        (ill_frac * 100).toFixed(4) + "% of the population is currently ill.<br>\n  There is a " + (probability * 100).toFixed(2) + "% chance that at least one person has Covid-19.<br>\n  There is a " + (asymptom_probability * 100).toFixed(2) + "% probability that at least one person is\n  an asymptomatic carrier.";
}
function changeInputMethod() {
    if (document.getElementById("cases-per-week-radio").checked) {
        var elements = document.getElementsByClassName("per-week-inputs");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline-block";
        }
        elements = document.getElementsByClassName("active-cases-inputs");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
    }
    else {
        var elements = document.getElementsByClassName("per-week-inputs");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
        elements = document.getElementsByClassName("active-cases-inputs");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline-block";
        }
    }
}
