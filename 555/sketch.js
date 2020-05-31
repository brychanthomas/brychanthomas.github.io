var globalTimer = 0.001;
const SAMPLE_RATE = 10; //milliseconds between each update

//increase the timer by SAMPLE_RATE milliseconds (the timer is needed to calculate
//the voltage of the capacitor)
function incrementTimer() {
  globalTimer += SAMPLE_RATE / 1000;
  graphs.update(); //measure voltages and add them to graph
}

//object containing the voltage of different points in the circuit which components
//can connect to
var voltages = {
  'b+': 9,
  'b-': 0,
  '1/3Vcc': 0,
  '2/3Vcc': 0,
  'S': 0,
  'R': 0,
  'Q': 0,
  "Q'": 0,
  'TriggerPin': 0,
  'ThresholdPin': 0,
  'DischargePin': 0,
  'OutputPin': 0,
  'Cap': 0
}

//create the components of the circuit
ic = new NE555(400, 230);

//each component must be given its values such as resistance as well as the identifiers
//of the connection points in the 'voltages' object it should connect to
var capacitor = new Capacitor(0.002, ['Cap','b-'], 1000+4000, 4000);
var capacitorWire = new Wire('Cap', ['TriggerPin', 'ThresholdPin']);
var resistors_1_2 = new Voltage_divider([1000, 4000], ['b+', 'DischargePin', 'Cap']);
var led = new Light_emitting_diode(['OutputPin', 'b-']);

//object which allows you to add and display components' symbols
var graphics = new Graphics_handler();
//each symbol must be given a component name and coordinates
graphics.add('capacitor', 667, 430);
graphics.add('resistor', 671, 280, 'vertical'); //R1
graphics.add('resistor', 671, 350, 'vertical'); //R2
graphics.add('cell', 504, 190); //battery
graphics.add('LED', 310, 360, '', led);

//object that allows you to add and display the colour-changing lines between
//components
var wires = new Voltage_line_handler();
//each line must be given a voltage point and two coordinates to connect
wires.add("b-", 503, 202, 340, 202); //battery- to ground pin
wires.add("b-", 340, 202, 340, 530);
wires.add("b-", 340, 258, 380, 258);

wires.add("b-", 340, 530, 679, 530); //battery- to capacitor
wires.add("b-", 679, 530, 679, 444);

wires.add("DischargePin", 679, 321, 679, 349); //between R1 and R2

wires.add("DischargePin", 640, 330, 679, 330); //discharge to R1 and R2

wires.add("Cap", 640, 400, 679, 400); //capacitor to threshold

wires.add("Cap", 679, 391, 679, 429); //capacitor to R2

wires.add("Cap", 650, 400, 650, 510); //capacitor to trigger
wires.add("Cap", 650, 510, 360, 510);
wires.add("Cap", 360, 510, 360, 330);
wires.add("Cap", 360, 330, 380, 330);

wires.add("b+", 518, 202, 679, 202); //battery+ to R1
wires.add("b+", 679, 202, 679, 279);

wires.add("b+", 679, 258, 640, 258); //battery+ to Vcc pin

wires.add("OutputPin", 380, 400, 310, 400); //Output pin to LED
wires.add("OutputPin", 310, 400, 310, 381);

wires.add("b-", 310, 339, 310, 320); //LED to battery-
wires.add("b-", 310, 320, 340, 320);


var capacitanceSlider, resistor1Slider, resistor2Slider;

//object that tracks voltage levels and shows them on a graph
//it must be given a list of voltage points to track and a list of line colours in RGB
var graphs = new Graph_handler(['Cap', 'OutputPin'], [[255,0,0], [0,255,0]]);

function setup() {
  setInterval(incrementTimer, SAMPLE_RATE); //start timer
  createCanvas(800,540);
  //create and position sliders for user to change values
  capacitanceSlider = createSlider(1, 2000, 500);
  capacitanceSlider.position(5, 200);
  resistor1Slider = createSlider(1, 4000, 1000);
  resistor1Slider.position(5, 250);
  resistor2Slider = createSlider(1, 4000, 4000);
  resistor2Slider.position(5, 300);
  msPerDivSlider = createSlider(5, 4000, 2000)
  msPerDivSlider.position(5,450);
}

function draw() {
  //set the values of components based on what user has set on the sliders
  capacitor.setCapacitance(capacitanceSlider.value() / 1000000);
  capacitor.setChargeResistance(resistor1Slider.value() + resistor2Slider.value());
  capacitor.setDischargeResistance(resistor2Slider.value());
  resistors_1_2.setResistances([resistor2Slider.value(), resistor1Slider.value()]);

  //if internal discharge transistor has changed from on to off or vice versa
  //change the capacitor from discharging to charging or vice versa
  if (ic.transistor.hasStateChanged()) {
    capacitor.changeState();
  }
  //update the voltages on components
  capacitor.update();
  capacitorWire.update();
  resistors_1_2.update();
  ic.update();
  led.update();

  background(0);
  fill(255);
  noStroke();
  textSize(15);
  //text next to the sliders
  text('Capacitance: '+capacitanceSlider.value()+'μF', 10, 200);
  text('R1 resistance: '+resistor1Slider.value()+'Ω', 10, 250);
  text('R2 resistance: '+resistor2Slider.value()+'Ω', 10, 300);
  text('ms per division: ' + msPerDivSlider.value()+'ms', 10, 450);
  //text next to R1 and R2
  text('R1', 690, 300);
  text('R2', 690, 370);

  //Use ... to get copy of voltage history so that it can be editied without affecting original
  let outputVoltageHistory = [...graphs.getVoltageHistory('OutputPin')].reverse();
  let periodSamples = 0, highSamples = 0, edgeCount = 0, i = 0;
  //find the number of samples the output pin is high for and the total number of
  //samples in the last three periods
  while (i < outputVoltageHistory.length && edgeCount < 7) {
    if (outputVoltageHistory[i] !== outputVoltageHistory[i+1]) {edgeCount++}
    if (edgeCount > 0) {
      periodSamples++;
      if (outputVoltageHistory[i] === 9) {highSamples++}
    }
    i++;
  }
  //calculate duty cycle
  let dutyCycle = Math.round(highSamples / periodSamples * 100);
  //calculate frequency from period. It is 3/period instead of 1/period because
  //the combined length of three periods is measured instead of one
  let frequency = (3 / (periodSamples * SAMPLE_RATE/1000)).toFixed(2);
  text('Duty cycle: '+dutyCycle+'%', 10, 360);
  text('Frequency: '+frequency+' Hz', 10, 380);

  //show graphs
  graphs.display(msPerDivSlider.value());
  //show component symbols
  ic.draw();
  graphics.draw();
  //show coloured wires
  wires.draw();

}
