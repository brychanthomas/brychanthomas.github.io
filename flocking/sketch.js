class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.mass = 1;
    this.maxSpeed = 7;
    this.maxForce = 5;
  }

  applyForce(force) {
    this.acceleration.add(force.div(this.mass));
  }

  draw() {
    circle(this.position.x, this.position.y, 10);
    this.position.x = this.position.x % width;
    this.position.y = this.position.y % height;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  seek(desiredPosition) {
    var desiredVelocity = p5.Vector.sub(desiredPosition, this.position);
    desiredVelocity.normalize();
    var distance = p5.Vector.dist(desiredPosition, this.position);
    if(distance < 100) {
      desiredVelocity.mult(map(distance, 0, 100, 0, this.maxForce))
    } else {
      desiredVelocity.mult(this.maxSpeed);
    }
    var steer = p5.Vector.sub(desiredVelocity, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  separate(otherBoids) {
    var desiredSeparation = 50;
    var sum = createVector(0,0);
    var count = 0;
    for (let boid of otherBoids) {
      var d = p5.Vector.dist(this.position, boid.position);
      if (d > 0 && d < desiredSeparation) {
        var diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      var steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0,0);
  }

  applyBehaviours(boidsArray) {
    var separateForce = this.separate(boidsArray);
    var seekForce = this.seek(createVector(mouseX, mouseY));

    separateForce.mult(0.5);
    seekForce.mult(1.5);

    this.applyForce(separateForce);
    this.applyForce(seekForce);
  }
}

class Flock {
  constructor(numBoids) {
    this.boidsArray = [];
    for (let i=0; i<numBoids; i++) {
      this.boidsArray.push(new Boid(random(500, 700), random(200, 400)));
    }
  }
  update() {
    for (let i=0; i<this.boidsArray.length; i++) {
      this.boidsArray[i].applyBehaviours(this.boidsArray);
      this.boidsArray[i].update();
    }
  }
  draw() {
    for (let i=0; i<this.boidsArray.length; i++) {
      this.boidsArray[i].draw();
    }
  }
}

var a;

function setup() {
  createCanvas(800, 500);
  a = new Flock(5);
}

function draw() {
  background(200);
  a.update();
  a.draw();
}
