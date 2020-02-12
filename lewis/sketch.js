var atoms = []; //array to hold each atom
var atom_counter = 0; //counts number of atoms to give each new atom an ID
var Elements; //dictionary to hold atomic number, symbol and colour of each element
var keysPressed = ""; //string holding all of the keys pressed so far, for two letter symbols such as 'Cl'

class Element { //class to store information about each element
	constructor (atomic_number, symbol, colour) {
		this.atomic_number = atomic_number;
		this.symbol = symbol;
		this.colour = colour;
		if (atomic_number < 3) {
			this.outer_shell_capacity = 2;
			this.valence_electrons = this.atomic_number;
		} else { //calculate electrons in outer shell of atom based on atomic number
			this.outer_shell_capacity = 8;
			let VE = atomic_number-2;
			this.valence_electrons = VE;
			VE = VE - 8;
			if (VE < 0) { return; }
			this.valence_electrons = VE;
			VE = VE - 18;
			if (VE < 0) { return; }
			this.valence_electrons = VE;
		}
	}
}

class Atom { //class to create and render each atom, its electrons and bonds between atoms
	constructor(elem,mousex,mousey){
		this.bond_directions=[];
		this.ID = atom_counter;
		atom_counter++;
		this.x = round_to_nearest_point(mousex);
		this.y = round_to_nearest_point(mousey);
		console.log(elem.valence_electrons);
		this.outer_shell = Array(elem.outer_shell_capacity).fill(0);
		for (let e=0; e<elem.valence_electrons; e++) { //array where shared electrons = 2, non-shared = 1, empty = 0
			this.outer_shell[e] = 1;
		}
		this.symbol = elem.symbol;
		this.colour = elem.colour;
		console.log(this.outer_shell);
		this.bond_lines=[];
	}
	render_bonds () { //show atom's bond lines to other atoms
		stroke(0);
		strokeWeight(4);
		for (let l of this.bond_lines) {
			if (atoms[l].x > this.x) {this.bond_directions.push(createVector(this.x+25, this.y));}
			else if (atoms[l].x < this.x) {this.bond_directions.push(createVector(this.x-25, this.y));}
			else if (atoms[l].y > this.y) {this.bond_directions.push(createVector(this.x, this.y+25));}
			else if (atoms[l].y < this.y) {this.bond_directions.push(createVector(this.x, this.y-25));}
			let count = count_in_array(this.bond_lines, l);
			if (count === 1) {
				line(this.x, this.y, atoms[l].x, atoms[l].y);
			} else if (count === 2) {
				if (atoms[l].x === this.x) {
					line(this.x-5, this.y, atoms[l].x-5, atoms[l].y);
					line(this.x+5, this.y, atoms[l].x+5, atoms[l].y);
				} else {
					line(this.x, this.y-5, atoms[l].x, atoms[l].y-5);
					line(this.x, this.y+5, atoms[l].x, atoms[l].y+5);
				}
			} else if (count === 3) {
				if (atoms[l].x === this.x) {
					line(this.x-7, this.y, atoms[l].x-7, atoms[l].y);
					line(this.x, this.y, atoms[l].x, atoms[l].y);
					line(this.x+7, this.y, atoms[l].x+7, atoms[l].y);
				} else {
					line(this.x, this.y-7, atoms[l].x, atoms[l].y-7);
					line(this.x, this.y, atoms[l].x, atoms[l].y);
					line(this.x, this.y+7, atoms[l].x, atoms[l].y+7);
				}
			} else if (count === 4) {
				if (atoms[l].x === this.x) {
					line(this.x-9, this.y, atoms[l].x-9, atoms[l].y);
					line(this.x-3, this.y, atoms[l].x-3, atoms[l].y);
					line(this.x+3, this.y, atoms[l].x+3, atoms[l].y);
					line(this.x+9, this.y, atoms[l].x+9, atoms[l].y);
				} else {
					line(this.x, this.y-9, atoms[l].x, atoms[l].y-9);
					line(this.x, this.y-3, atoms[l].x, atoms[l].y-3);
					line(this.x, this.y+3, atoms[l].x, atoms[l].y+3);
					line(this.x, this.y+9, atoms[l].x, atoms[l].y+9);
				}
			}
		}
	}
	render () { //show atom and unbonded electrons
		fill(this.colour);
		noStroke();
		circle(this.x, this.y, 40);
		fill(255);
		textSize(20);
		if (count_in_array(this.outer_shell, '0') > 0) {
			textStyle(BOLD);
		}
		else {
			textStyle(NORMAL);
		}
		text(this.symbol, this.x-7, this.y+7);
		let nonbonding_electrons = count_in_array(this.outer_shell, '1'); //count electrons not used for bonding
		let ydirections = [createVector(this.x, this.y-25),createVector(this.x, this.y+25)];
		let xdirections = [createVector(this.x-25, this.y),createVector(this.x+25, this.y)];
		let electrons_per_direction = nonbonding_electrons / (4-this.bond_directions.length)
		for (let dir of ydirections) { //place electrons on side of atom with no bonds if possible
			if (!vector_in_array(this.bond_directions,dir) || electrons_per_direction > 2) {
				if (nonbonding_electrons > 0) {
					nonbonding_electrons = nonbonding_electrons-1;
					fill(0);
					circle(dir.x-5, dir.y, 7);
				}
				if (nonbonding_electrons > 0) {
					nonbonding_electrons = nonbonding_electrons-1;
					fill(0);
					circle(dir.x+5, dir.y, 7);
				}
			}
		}
		for (let dir of xdirections) {
			if (!vector_in_array(this.bond_directions,dir) || electrons_per_direction > 2) {
				if (nonbonding_electrons > 0) {
					nonbonding_electrons = nonbonding_electrons-1;
					fill(0);
					circle(dir.x, dir.y-5, 7);
				}
				if (nonbonding_electrons > 0) {
					nonbonding_electrons = nonbonding_electrons-1;
					fill(0);
					circle(dir.x, dir.y+5, 7);
				}
			}
		}
		this.bond_directions = [];
	}
}

function setup(){
	Elements = { //elements are stored in a dictionary with the key being the keyboard buttons you must press
		"o": new Element(8, "O", color(255, 0, 0)),
		"c": new Element(6, "C", color(0,0,0)),
		"h": new Element(1, "H", color(150 ,150,150)),
		"n": new Element(7, "N", color(0 ,0,255)),
		"f": new Element(9, "F", color(219, 191, 29)),
		"Cl": new Element(17, "Cl", color(32, 161, 27)),
		"Br": new Element(35, "Br", color(219, 116, 20)),
		"s": new Element(16, "S", color(219,212,0)),
		"p": new Element(15, "P", color(150,0,0)),
		"Si": new Element(14, "Si", color(217,2,181))
	};
	createCanvas(windowWidth, windowHeight);
	alert(`
	To add an atom at the mouse position, press a keyboard key.
	To add an atom with a two letter symbol, hold shift when pressing the first letter and then press the second letter without shift.
	Click between atoms to add covalent bonds.
	The elements available are O, C, H, N, F, Cl, Br, S, P and Si.
	Enjoy!`); //instructions
}

function draw(){ //render each atom and their bonds every frame
	background(255);
	for (let a of atoms) {
		a.render_bonds();
	}
	for (let a of atoms) {
		a.render();
	}
}

function keyPressed() { //add atoms when button pressed
	let x = round_to_nearest_point(mouseX);
	let y = round_to_nearest_point(mouseY);
	let place_taken = false;
	for (let a of atoms) {
		if (a.x === x && a.y === y) {
			place_taken = true;
		}
	}

	keysPressed = keysPressed + key;
	
	if (place_taken === false) {
		if (Elements[key] !== undefined) {
			atoms.push(new Atom(Elements[key],mouseX,mouseY));
		} else if (Elements[keysPressed.slice(-2)] !== undefined) {
			atoms.push(new Atom(Elements[keysPressed.slice(-2)],mouseX,mouseY));
		}
	}
}

function mouseClicked() { //add bonds when mouse clicked
	let atom1;
	let atom2;
	let x = round_to_nearest_point(mouseX);
	let y = round_to_nearest_point(mouseY);
	let min = 85;
	for (let a of atoms) { //find first near atom
		if (dist(a.x, a.y, mouseX, mouseY) <= min) {
			atom1 = a;
			min = dist(a.x, a.y, mouseX, mouseY);
		}
	}
	if (atom1 == undefined) { return; }
	min = 85;
	for (let a of atoms) { //find second near atom
		if (dist(a.x, a.y, mouseX, mouseY) <= min && a.ID != atom1.ID) {
			atom2 = a;
			min = dist(a.x, a.y, mouseX, mouseY);
		}
	}
	if (atom2 == undefined) { return; }
	let a1e = atom1.outer_shell.indexOf(0);
	let a2e = atom2.outer_shell.indexOf(0);
	let a1_unbonded = count_in_array(atom1.outer_shell,1);
	let a2_unbonded = count_in_array(atom2.outer_shell,1);
	let a1_empty = count_in_array(atom1.outer_shell,0);
	let a2_empty = count_in_array(atom2.outer_shell,0);
	
	if (a1e != -1 && a2e != -1) { //if both have non-full outer shells
		atom1.outer_shell[a1e] = 2;
		atom1.outer_shell[atom1.outer_shell.indexOf(1)] = 2;
		atom2.outer_shell[a2e] = 2;
		atom2.outer_shell[atom2.outer_shell.indexOf(1)] = 2;
		console.log(atom1.outer_shell);
		atom1.bond_lines.push(atom2.ID);
		atom2.bond_lines.push(atom1.ID);
		console.log(atom1.ID, atom1.bond_lines);
		console.log(atom2.ID, atom2.bond_lines);
	} else if (a2_empty > 1 && a1_unbonded > 1 && atom1.symbol !== atom2.symbol) { //if one has non-full outer shell and other has unbonded electrons
		atom1.outer_shell[atom1.outer_shell.indexOf(1)] = 2; //form coordinate bond
		atom1.outer_shell[atom1.outer_shell.indexOf(1)] = 2;
		atom2.outer_shell[atom2.outer_shell.indexOf(0)] = 2;
		atom2.outer_shell[atom2.outer_shell.indexOf(0)] = 2;
		atom1.bond_lines.push(atom2.ID);
		atom2.bond_lines.push(atom1.ID);
	} else if (a1_empty > 1 && a2_unbonded > 1 && atom1.symbol !== atom2.symbol) {
		atom2.outer_shell[atom2.outer_shell.indexOf(1)] = 2;
		atom2.outer_shell[atom2.outer_shell.indexOf(1)] = 2;
		atom1.outer_shell[atom1.outer_shell.indexOf(0)] = 2;
		atom1.outer_shell[atom1.outer_shell.indexOf(0)] = 2;
		atom1.bond_lines.push(atom2.ID);
		atom2.bond_lines.push(atom1.ID);
	}
}

function round_to_nearest_point(coordinate) { //round to nearest multiple of 80
	return Math.round(coordinate / 80) * 80;
}

function count_in_array(array, term) { //count occurences of item in array
	let count = 0;
	for (let itm of array) {
		if (itm == term) {
			count++
		}
	}
	return count;
}
function vector_in_array(array, vector) { //check if a vector is in an array
	for (let v of array) {
		if (v.x === vector.x && v.y === vector.y) {
			return true;
		}
	}
	return false;
}
