class Flocker {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.mass = 1;
  }

  applyForce(force) {
    acceleration.add(force.div(this.mass));
  }

  display() {
    circle(this.position.x, this.position.y, 10);
  }

  update() {
    velocity.add(acceleration);
    position.add(velocity);
    acceleration.mult(0);
  }
}

function setup() {
  createCanvas(800, 500);
}

function draw() {

}
