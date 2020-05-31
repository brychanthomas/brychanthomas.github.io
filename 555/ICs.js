class NE555 {
  constructor(x, y) {
    this.setup_components();
    this.setup_graphics(x, y);
    this.setup_voltage_lines(x, y);
    this.x = x;
    this.y = y;
  }
  setup_components() { //create all of the components inside the timer
    this.resistors_555 = new Voltage_divider([5000,5000,5000], ['b-', '1/3Vcc', '2/3Vcc', 'b+']);
    this.comparator_1 = new Comparator(['TriggerPin', '1/3Vcc', 'b-', 'b+', 'S']);
    this.comparator_2 = new Comparator(['2/3Vcc', 'ThresholdPin', 'b-', 'b+', 'R']);
    this.flip_flop = new SR_flip_flop(['S', 'R', 'Q', "Q'", 'b-', 'b+']);
    this.transistor = new NPN_transistor(['b-', "Q'"]);
    this.outputWire = new Wire("Q", ["OutputPin"]);
  }
  setup_graphics(x, y) { //add all of the in the IC to the graphics handler
    this.graphics = new Graphics_handler();
    this.graphics.add('comparator', x+30, y+110);
    this.graphics.add('comparator', x+130, y+110);
    this.graphics.add('transistor', x+20, y+70);
    this.graphics.add('resistor', x+20, y+20, 'horizontal'); //555 resistors
    this.graphics.add('resistor', x+90, y+20, 'horizontal');
    this.graphics.add('resistor', x+160, y+20, 'horizontal');
    this.graphics.add('flip_flop', x+70, y+200);
  }
  setup_voltage_lines(x, y) { //add all of the lines between components in the IC to the voltage line handler
    this.wires = new Voltage_line_handler();

    this.wires.add("DischargePin", x+51, y+54, x+210, y+54); //transistor to discharge pin
    this.wires.add("DischargePin", x+210, y+54, x+210, y+100);
    this.wires.add("DischargePin", x+210, y+100, x+240, y+100);

    this.wires.add('S', x+60, y+160, x+60, y+175); //comparator 1 to flip flop
    this.wires.add('S', x+60, y+175, x+85, y+175);
    this.wires.add('S', x+85, y+175, x+85, y+200);

    this.wires.add('R', x+160, y+160, x+160, y+175); //comparator 2 to flip flop
    this.wires.add('R', x+160, y+175, x+135, y+175);
    this.wires.add('R', x+135, y+175, x+135, y+200);

    this.wires.add("Q'", x+85, y+250, x+85, y+255); //Q' to transistor
    this.wires.add("Q'", x+85, y+255, x+25, y+255);
    this.wires.add("Q'", x+25, y+255, x+25, y+80);
    this.wires.add("Q'", x+25, y+80, x+32, y+80);
    this.wires.add("Q'", x+25, y+80, x+32, y+80);
    this.wires.add("Q'", x+32, y+80, x+32, y+70);

    this.wires.add('Q', x+135, y+250, x+135, y+265); //Q to output pin
    this.wires.add('Q', x+135, y+265, x+10, y+265);
    this.wires.add('Q', x+10, y+265, x+10, y+170);
    this.wires.add("OutputPin", x+10, y+170, x-20, y+170); //output pin

    this.wires.add("1/3Vcc", x+75, y+28, x+75, y+110); //555 resistors to comparator 1
    this.wires.add("1/3Vcc", x+60, y+28, x+90, y+28); //between resistors

    this.wires.add("2/3Vcc", x+145, y+28, x+145, y+110); //555 resistors to comparator 2
    this.wires.add("2/3Vcc", x+130, y+28, x+160, y+28); //between resistors

    this.wires.add('b-', x-20, y+28, x+20, y+28);
    this.wires.add('b+', x+200, y+28, x+240, y+28);

    this.wires.add("TriggerPin", x+45, y+110, x+45, y+100); //trigger pin to comparator 1
    this.wires.add("TriggerPin", x+45, y+100, x-20, y+100); //Trigger pin

    this.wires.add("ThresholdPin", x+175, y+110, x+175, y+100); //threshold pin to comparator 2
    this.wires.add("ThresholdPin", x+175, y+100, x+200, y+100);
    this.wires.add("ThresholdPin", x+200, y+100, x+200, y+170);
    this.wires.add("ThresholdPin", x+200, y+170, x+240, y+170);

    this.wires.add("b-", x+15, y+54, x+10, y+54); //transistor to ground
    this.wires.add("b-", x+10, y+54, x+10, y+28);

  }
  update() { //update all of the voltages in the IC
    this.resistors_555.update();
    this.comparator_1.update();
    this.comparator_2.update();
    this.flip_flop.update();
    this.transistor.update();
    this.outputWire.update();
  }
  draw() { //display the timer's body, the components and the wires in the IC
    noFill();
    stroke(150);
    fill(50);
    rect(this.x, this.y, 220, 270, 10); //IC body
    rect(this.x-10, this.y+20, 10, 20); //pins
    rect(this.x-10, this.y+90, 10, 20);
    rect(this.x-10, this.y+160, 10, 20);
    rect(this.x-10, this.y+230, 10, 20);
    rect(this.x+220, this.y+20, 10, 20);
    rect(this.x+220, this.y+90, 10, 20);
    rect(this.x+220, this.y+160, 10, 20);
    rect(this.x+220, this.y+230, 10, 20);
    this.wires.draw();
    this.graphics.draw();
  }
}
