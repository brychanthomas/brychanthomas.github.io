class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.mass = 1;
  }

  applyForce(force) {
    this.acceleration.add(force.div(this.mass));
  }

  display() {
    circle(this.position.x, this.position.y, 10);
    this.position.x = this.position.x % width;
    this.position.y = this.position.y % height;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
}

var a;

function setup() {
  createCanvas(800, 500);
  a = new Boid(100, 100);
}

function draw() {
  background(200);
  a.applyForce(createVector(0, 0.05));
  a.update();
  a.display();
}
