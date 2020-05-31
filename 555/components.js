//module of electronic components

class Voltage_divider { //array of resistors
  constructor(resistances, connections) { //array of resistances and array of connections
    this.current = 0;
    this.resistances = resistances;
    this.totalResistance = resistances.reduce((a, b) => a + b, 0); //sum array
    this.connections = connections;
  }
  setResistances(resistances) {
    this.resistances = resistances;
  }
  update() { //update voltage at each connection point
    let voltageLeft = voltages[this.connections[0]];
    let voltageRight = voltages[this.connections[this.connections.length-1]]
    let minVoltage = Math.min(voltageLeft, voltageRight);
    voltageLeft = voltageLeft - minVoltage;
    voltageRight = voltageRight - minVoltage;
    let conns = this.connections;
    let resis = this.resistances;
    if (voltageRight < voltageLeft) {
      conns = conns.reverse();
      resis = resis.reverse();
      let temp = voltageRight;
      voltageRight = voltageLeft;
      voltageLeft = voltageRight;
    }
    let resistanceSoFar = 0;
    let voltageHere = 0;
    for (let r=0;r<resis.length-1;r++) {
      resistanceSoFar += resis[r];
      voltageHere = (resistanceSoFar/this.totalResistance)*voltageRight + minVoltage;
      voltages[conns[r+1]] = voltageHere;
    }
    this.current = voltageRight / this.totalResistance;
  }
}

class Capacitor { //simulates capacitor with one end connected to ground
  constructor(capacitance, connections, chargeResistance, dischargeResistance) {
    //capacitance in Farad, array containing anode and cathode, resistance between
    //anode and voltage source and resistance between anode and ground
    this.connection1 = connections[0];
    this.groundConn = connections[1];
    this.state = 'discharging';
    this.timerOffset = 0;
    this.capacitance = capacitance;
    //resistance between capacitor and ground when it is charging
    this.chargeResistance = chargeResistance;
    //resistance between capacitor and ground when it is discharging
    this.dischargeResistance = dischargeResistance;
    //the voltage of the capacitor in the previous frame
    this.prevVoltage = 0;
  }
  setChargeResistance(newResistance) {
    this.chargeResistance = newResistance;
  }
  setDischargeResistance(newResistance) {
    this.dischargeResistance = newResistance;
  }
  setCapacitance(newCapacitance) {
    this.capacitance = newCapacitance;
  }
  update() { //update voltage on capacitor pin
    let timer = globalTimer - this.timerOffset;
    if (this.state === 'charging') {
      voltages[this.connection1] = voltages['b+'] - this.prevVoltage;
      voltages[this.connection1] *= 1-(Math.E**(-timer / (this.capacitance * this.chargeResistance)));
      voltages[this.connection1] += this.prevVoltage;
      this.topVoltage = voltages[this.connection1];
    } else {
      voltages[this.connection1] = this.prevVoltage;
      voltages[this.connection1] *= Math.E**(-timer / (this.capacitance * this.dischargeResistance));
    }
  }
  resetTimer() { //update timer offset when state changes
    this.timerOffset = globalTimer;
  }
  changeState() { //change from charging to discharging or vice versa
    this.resetTimer();
    this.prevVoltage = voltages[this.connection1];
    if (this.state === 'charging') {
      this.state = 'discharging';
    } else {
      this.state = 'charging';
    }
  }
}

class Comparator { //comparator, compares two inputs and outputs 1 if Vin+ > Vin-
  constructor(connections) {
    //connections in order: V- input, V+ input, ground, Vcc, output pin
    this.vminus = connections[0];
    this.vplus = connections[1];
    this.ground = connections[2];
    this.Vcc = connections[3];
    this.output = connections[4];
  }
  update() { //update voltage on output pin
    if (voltages[this.vplus] > voltages[this.vminus]) {
      voltages[this.output] = voltages[this.Vcc];
    } else {
      voltages[this.output] = voltages[this.ground];
    }
  }
}

class SR_flip_flop {
  constructor(connections) {
    //connections in order: S input, R input, Q output, Q' output, ground, Vcc
    this.S = connections[0];
    this.R = connections[1];
    this.Q = connections[2];
    this.QComplement = connections[3];
    this.ground = connections[4];
    this.Vcc = connections[5];
  }
  update() { //update voltages on output pins
    let highLevel = voltages[this.Vcc]  * 2/3;
    let s = voltages[this.S];
    let r = voltages[this.R];
    if (s < highLevel && r > highLevel) {
      voltages[this.Q] = voltages[this.ground];
      voltages[this.QComplement] = voltages[this.Vcc];
    } else if (s > highLevel && r < highLevel) {
      voltages[this.Q] = voltages[this.Vcc];
      voltages[this.QComplement] = voltages[this.ground];
    }
  }
}

class NPN_transistor { //extremely simplified and naive "transistor"
  constructor(connections) {
    //array containing emitter and base
    this.emitter = connections[0];
    this.base = connections[1];
  }
  hasStateChanged() { //check if changed from on to off or vice versa
    return this.state !== this.prevState;
  }
  update() { //turn on if voltage on base is greater than 3v
    //the resistance or current through is not calculated because it is not needed
    //for this project - we only need to know if it is on or not so that we can
    //set the capacitor to discharge or charge accordingly
    this.prevState = this.state;
    if (voltages[this.base] > 3) {
      this.state = "on";
    } else {
      this.state = "off";
    }
  }
}

class Wire { //connects different connections together so that their voltages are always the same
  constructor(sourceVoltage, connections) {
    //voltage point to copy, array of voltage points to copy it to
    this.sourceVoltage = sourceVoltage;
    this.connections = connections;
  }
  update() {
    let voltage = voltages[this.sourceVoltage];
    this.connections.forEach(function(conn, index) {
      voltages[conn] = voltage;
    })
  }
}

class Light_emitting_diode { //turns on if voltage across it is greater than 3v
  constructor(connections) { //array containing anode and cathode
    this.anode = connections[0];
    this.cathode = connections[1];
    this.state = "off";
  }
  getState() {
    return this.state;
  }
  update() {
    if(voltages[this.anode] - voltages[this.cathode] > 3) {
      this.state = "on";
    } else {
      this.state = "off";
    }
  }
}
