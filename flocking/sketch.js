//flocking simulation based on Daniel Shiffman's Nature of Code book:
//https://natureofcode.com/book/chapter-6-autonomous-agents/

//a single animal animal
class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0,0);
    this.mass = 1;
    this.maxSpeed = 5;
    this.maxForce = 0.05;

    this.separationWeight = 0.8;
    this.alignmentWeight = 2;
    this.cohesionWeight = 1.5;
  }

  //apply a force by changing the acceleration
  applyForce(force) {
    this.acceleration.add(force.div(this.mass));
  }

  //draw a triangle facing the direction of the boid
  draw() {
    push();
    fill(230);
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    triangle(0, -6, 0, 6, 15, 0);
    pop();
    if (this.position.x < 0) {
      this.position.x = width-1;
    }
    if (this.position.y < 0) {
      this.position.y = height-1;
    }
    this.position.x = this.position.x % width;
    this.position.y = this.position.y % height;
  }

  //update the velocity and position of the boid and reset the acceleration
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  //go towards a specific point.
  seek(desiredPosition) {
    var desiredVelocity = p5.Vector.sub(desiredPosition, this.position);
    desiredVelocity.normalize();
    var distance = p5.Vector.dist(desiredPosition, this.position);
    if(distance < 20) {
      desiredVelocity.mult(map(distance, 0, 20, 0, this.maxForce))
    } else {
      desiredVelocity.mult(this.maxSpeed);
    }
    var steer = p5.Vector.sub(desiredVelocity, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  //calculate the steering force to stay separate from other nearby boids
  separate(otherBoids) {
    var desiredSeparation = 40;
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

  //calculate the steering force needed to change velocity to equal the average
  //of nearby boids
  align(otherBoids) {
    var sum = createVector(0,0);
    var count = 0;
    var neighbourhoodRadius = 50;
    for (let boid of otherBoids) {
      let distance = p5.Vector.dist(this.position, boid.position);
      if (distance > 0 && distance < neighbourhoodRadius) {
        sum.add(boid.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      var steeringForce = p5.Vector.sub(sum, this.velocity);
      steeringForce.limit(this.maxForce);
      return steeringForce;
    }
    return createVector(0,0);
  }

  //calculate the steering force necessary to move towards nearby boids
  cohesion(otherBoids) {
    var sum = createVector(0,0);
    var count = 0;
    var neighbourhoodRadius = 50;
    for (let boid of otherBoids) {
      let distance = p5.Vector.dist(this.position, boid.position);
      if (distance > 0 && distance < neighbourhoodRadius) {
        sum.add(boid.position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }
    return createVector(0,0);
  }

  //apply the separation, alignment and cohesion forces with their weightings
  applyBehaviours(boidsArray) {
    var separateForce = this.separate(boidsArray);
    var alignForce = this.align(boidsArray);
    var cohesionForce = this.cohesion(boidsArray);

    //adjust the weightings of the forces
    separateForce.mult(this.separationWeight);
    alignForce.mult(this.alignmentWeight);
    cohesionForce.mult(this.cohesionWeight);

    this.applyForce(separateForce);
    this.applyForce(alignForce);
    this.applyForce(cohesionForce);
  }
}

//a flock of boids
class Flock {
  constructor(numBoids) {
    this.boidsArray = [];
    for (let i=0; i<numBoids; i++) {
      this.boidsArray.push(new Boid(random(500, 550), random(200, 250)));
    }
  }

  //apply forces and update the state of each boid in the flock
  update() {
    for (let i=0; i<this.boidsArray.length; i++) {
      this.boidsArray[i].applyBehaviours(this.boidsArray);
      this.boidsArray[i].update();
    }
  }

  //draw each boid in the flock
  draw() {
    for (let i=0; i<this.boidsArray.length; i++) {
      this.boidsArray[i].draw();
    }
  }

  //set the weightings of the three behaviours
  set separation (weight) {
    this.boidsArray.forEach((boid) => boid.separationWeight = weight);
  }

  set alignment (weight) {
    this.boidsArray.forEach((boid) => boid.alignmentWeight = weight);
  }

  set cohesion (weight) {
    this.boidsArray.forEach((boid) => boid.cohesionWeight = weight);
  }
}

var separationSlider, alignmentSlider, cohesionSlider;

function setup() {
  createCanvas(800, 500);
  flock = new Flock(100);
  separationSlider = createSlider(0, 3, 1.3, 0.1);
  separationSlider.position(10, height);
  alignmentSlider = createSlider(0, 3, 1.3, 0.1);
  alignmentSlider.position(160, height);
  cohesionSlider = createSlider(0, 3, 1, 0.1);
  cohesionSlider.position(320, height);
}

function draw() {
  background(40);
  text('Separation',10, height-5);
  text('Alignment',160, height-5);
  text('Cohesion',320, height-5);
  flock.separation = separationSlider.value();
  flock.alignment = alignmentSlider.value();
  flock.cohesion = cohesionSlider.value();
  flock.update();
  flock.draw();
}
