var gravitational_constant = 50;
var objects = [];
var numberOfObjects = 0; //used to give each object an ID so it can be recognised
var paused = false;

function setup() { //runs once when program starts
	//objects = [new object(40, createVector(800,800), createVector(-2.5,0)), new object(40, createVector(800,1000), createVector(2.5,0))];
	
	createCanvas(windowWidth, windowHeight);
}

function draw() { //runs every frame
	if (paused === true) {return 0}
	background(25);
	for (var obj=0; obj<objects.length; obj++) {
		if (objects[obj] != undefined) {
			objects[obj].update()
			if (objects[obj] != undefined) {
				objects[obj].show()
			}
		}
	}
}

function mouseClicked() { //create a new object when canvas is clicked
	var x = mouseX;
	var y = mouseY;
	paused = true;
	var mass = parseFloat(prompt("Enter mass: ", "40"));
	var xv = parseFloat(prompt("Enter x velocity: ", "0"));
	var yv = parseFloat(prompt("Enter y velocity: ", "0"));
	objects.push(new object(mass, createVector(x,y), createVector(xv,yv)));
	paused = false;
}

function keyPressed() { //pause when p pressed
	if (key==='p') {
		paused = !paused;
	}
}

class object { //a class used to create an object (planet, particle or whatever you want to call it)
	constructor(mass,position,velocity) {
		this.mass = mass;
		this.x = position.x;
		this.y = position.y;
		this.velocity = velocity;
		this.number = numberOfObjects;
		numberOfObjects++;
		this.trailPositions=[];
		
		let red = random(255); //find a colour that stands out on black background
		let green = random(255);
		let blue = random(255);
		//formula for determining brightness of an RGB colour
		let brightness  =  Math.sqrt(0.241 * Math.pow(red,2) + 0.691 * Math.pow(green,2) + 0.068 * Math.pow(blue,2))
		while (brightness < 100) {
			red = random(255);
			green = random(255);
			blue = random(255);
			brightness  =  Math.sqrt(0.241 * Math.pow(red,2) + 0.691 * Math.pow(green,2) + 0.068 * Math.pow(blue,2))
		}
		this.colour = color(red, green, blue);
	}
	calculate_force_with(other_object) { //use gravity equation to find x and y force components with other object
		var distance = Math.sqrt(Math.pow(this.x-other_object.x,2) + Math.pow(this.y-other_object.y,2));
		if (distance < 30) {
			this.collide(other_object);
			return createVector(0,0);
		}
		//Law of universal gravitation
		var force = gravitational_constant * ((this.mass * other_object.mass) / Math.pow(distance,2));
		var direction = Math.atan(Math.abs(this.y-other_object.y) / Math.abs(this.x-other_object.x));
		var fx = force * Math.abs(Math.cos(direction));
		var fy = force * Math.abs(Math.sin(direction));
		if (other_object.x < this.x) {fx = fx*-1}
		if (other_object.y < this.y) {fy = fy*-1}
		this.fx = fx;
		this.fy = fy;
		return createVector(fx,fy);
	}
	collide(other_object) { //fuse two objects to create a single object
		//momentum equation
		var myMomentum = createVector(this.mass * this.velocity.x, this.mass * this.velocity.y);
		var otherMomentum = createVector(other_object.mass * other_object.velocity.x, other_object.mass * other_object.velocity.y);
		var momentumSum = createVector (myMomentum.x + otherMomentum.x, myMomentum.y + otherMomentum.y);
		this.mass = this.mass + other_object.mass;
		this.velocity = createVector (momentumSum.x / this.mass, momentumSum.y / this.mass);
		var fx=0;
		var fy=0;
		for (let i=0; i<objects.length; i++) {
			if (objects[i].number == other_object.number) {
				objects.splice(i, 1);
				break
			}
		}
	}
	calculate_acceleration(force) { //calculate acceleration on x and y axis based on force
		//Newton's second law
		var ax=force.x / this.mass;
		var ay=force.y / this.mass;
		return createVector(ax, ay);
	}
	accelerate(acceleration) { //change velocity based on acceleration
		this.velocity.x = this.velocity.x + acceleration.x;
		this.velocity.y = this.velocity.y + acceleration.y;
	}
	move () { //move object based on velocities
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
	update () { //update object's position and its trail
		for (let obj=0; obj<objects.length; obj++) {
			if (this.number != objects[obj].number) {
				var force = this.calculate_force_with(objects[obj]);
				var acceleration = this.calculate_acceleration(force);
				this.accelerate(acceleration);
			}
		}
		this.move();
		this.trailPositions.push(createVector(this.x,this.y));
		if (this.trailPositions.length > 500) {
			this.trailPositions.splice(0,1);
		}
	}
	show() { //draw the object and its trail on the canvas
		noFill();
		beginShape();
		stroke(this.colour);
		for (let i=0; i < this.trailPositions.length; i++) {
			var pos = this.trailPositions[i]
			vertex(pos.x, pos.y);
		}
		endShape();
		fill(this.colour);
		circle(this.x, this.y, this.mass/2);
	}
}
