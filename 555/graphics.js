class Graph_handler { //track voltages and show graphs
  constructor(connections, colours) { //array of voltages to track and line colours
    this.colours = colours;
    this.connections = connections;
    this.voltageHistories = [];
    for (let i=0; i<connections.length; i++) {
      this.voltageHistories.push([]);
    }
  };
  add(connections, colours) { //add a voltage level to track
    this.connections = this.connections.concat(connections);
    this.colours = this.colours.concat(colours);
    for (let i=0; i<connections.length; i++) {
      this.voltageHistories.push([]);
    }
  }
  update() { //add current voltages to history
    for(let i=0; i<this.connections.length; i++) {
      this.voltageHistories[i].push(voltages[this.connections[i]]);
    }
  }
  getVoltageHistory(connection) { //get the voltage history for a specific connection
    return this.voltageHistories[this.connections.indexOf(connection)];
  }
  display(msPerDiv) { //draw the graph, taking into account the time scale
    stroke(75);
    line(20, 170, width-20, 170); //horizontal lines
    line(20, 120, width-20, 120);
    line(20, 70, width-20, 70);
    line(20, 20, width-20, 20);
    for(let l=20; l < width-19; l = l+40) { //vertical lines
      line(l, 20, l, 170);
    }
    noStroke();
    fill(125);
    text('0v', 0, 175); //voltage labels next to horizontal lines
    text('3v', 0, 125);
    text('6v', 0, 75);
    text('9v', 0, 25);
    let timeDivider = msPerDiv / SAMPLE_RATE; //used to scale graph based on ms/div
    timeDivider /= 40;
    let colours = this.colours;
    this.voltageHistories.forEach(function (history, index) {
      beginShape();
      noFill();
      stroke(colours[index]);
      while (history.length/timeDivider > width-40) {
        history.splice(0, 1); //remove first item so that every point is moved over
      }
      for (let p=0; p<history.length; p++) {
        let y = map(history[p], 0, 9, 170, 20);
        vertex((p/timeDivider)+21, y); //draw each point as a vertex
      }
      endShape();
    });
  }
}

class Graphics_handler { //draw component diagrams
  constructor () {
    this.components = []; //list of components to draw
  }
  add (component, x, y, direction, object) { // add a component
    //needs the name of the component and its x and y coordinates. Some
    //components also need the direction it is facing (resistor) and the object
    //representing the component itself (LED)
    this.components.push({'component':component, 'x':x, 'y':y, 'direction':direction, 'object':object});
  }
  draw () { //draw each component that has been added
    for (let i=0; i< this.components.length; i++) {
      stroke(255);
      noFill();
      switch(this.components[i].component) {
        case 'comparator':
          this.draw_comparator(this.components[i].x, this.components[i].y); break;
        case 'transistor':
          this.draw_transistor(this.components[i].x, this.components[i].y); break;
        case 'resistor':
          this.draw_resistor(this.components[i].x, this.components[i].y, this.components[i].direction); break;
        case 'flip_flop':
          this.draw_flip_flop(this.components[i].x, this.components[i].y); break;
        case'capacitor':
          this.draw_capacitor(this.components[i].x, this.components[i].y); break;
        case 'cell':
          this.draw_cell(this.components[i].x, this.components[i].y); break;
        case 'LED':
          this.draw_LED(this.components[i].x, this.components[i].y, '', this.components[i].object); break;
      }
    }
  }
  draw_comparator(x, y) {
    triangle(x, y, x+60, y, x+30, y+50);
    line(x+10, y+7, x+16, y+7);
    line(x+44, y+7, x+50, y+7);
    line(x+47, y+4, x+47, y+10);
  }
  draw_transistor(x, y) {
    line(x, y, x+25, y);
    line(x+5, y, x-5, y-15);
    line(x+20, y, x+30, y-15);
    triangle(x-5, y-15, x-5, y-12, x-2, y-14);
  }
  draw_resistor(x, y, direction) {
    //draw a resistor horizontally or vertically
    if (direction === 'vertical') {
      rect(x, y, 16, 40);
    } else {
      rect(x, y, 40, 16);
    }
  }
  draw_flip_flop(x, y) {
    rect(x, y, 80, 50);
    textSize(10);
    noStroke();
    fill(255);
    text('S', x+10, y+15);
    text('R', x+63, y+15);
    text("Q\u0305", x+10, y+40); //overbar
    text('Q', x+63, y+40);
  }
  draw_capacitor(x, y) {
    fill(255);
    rect(x, y, 25, 2);
    rect(x, y+10, 25, 2);
  }
  draw_cell(x, y) {
    rect(x, y+7, 2, 11);
    rect(x+10, y, 2, 25)
  }
  draw_LED(x, y, direction, object) {
    //if the LED is turned on make a blue circle to show this otherwise have
    //no fill
    if (object.getState()==="on") {
      fill([0, 0, 175]);
    }
    circle(x, y, 40);
    noFill();
    triangle(x, y-9, x-10, y+10, x+10, y+10);
    line(x-10, y-9, x+10, y-9);
    line(x, y+10, x, y+20); //wire lines
    line(x, y-9, x, y-20);
    line(x-20, y-15, x-30, y-25); //arrow lines
    line(x-13, y-22, x-23, y-32);
    fill(255);
    triangle(x-30, y-25, x-30, y-21, x-26, y-25);
    triangle(x-23, y-32, x-23, y-28, x-19, y-32);
  }
}

class Voltage_line_handler { //draw the lines that change colour depending on voltage
  constructor(lines) {
    this.lines = lines || []; //optionally pass in list of objects representing lines
  }
  add (connection, x1, y1, x2, y2) { //add a new line between two points
    this.lines.push({'connection':connection, 'x1':x1, 'y1':y1,
                     'x2':x2, 'y2':y2})
  }
  draw() { //display all of the lines each frame
    strokeWeight(2);
    this.lines.forEach(function(wire, index) {
      //at 0v red = 255 and green = 0, at 9v red = 0 and green = 255
      let green = map(voltages[wire.connection], 0, 9, 0, 255);
      let red = map(voltages[wire.connection], 0, 9, 255, 0);
      stroke([red, green, 0]);
      line(wire.x1, wire.y1, wire.x2, wire.y2);
    });
    strokeWeight(1);
  }
}
