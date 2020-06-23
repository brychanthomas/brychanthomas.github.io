class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.mass = 1;
    this.maxSpeed = 7;
    this.maxForce = 0.1;
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
    this.applyForce(this.calculateSteeringForce(createVector(mouseX, mouseY)));
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  calculateSteeringForce(desiredPosition) {
    var desiredVel = p5.Vector.sub(desiredPosition, this.position);
    var d = desiredVel.mag();
    desiredVel.normalize();
    if (d < 100) {
      desiredVel.mult(map(d, 0, 100, 0, this.maxSpeed));
    } else {
      desiredVel.mult(this.maxSpeed);
    }
    var steeringForce = p5.Vector.sub(desiredVel, this.velocity);
    steeringForce.limit(this.maxForce);
    return steeringForce;
  }
}

var a;

function setup() {
  createCanvas(800, 500);
  a = new Boid(100, 100);
}

function draw() {
  background(200);
  a.update();
  a.display();
}
