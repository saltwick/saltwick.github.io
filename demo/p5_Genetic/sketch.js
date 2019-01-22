/* Sam Saltwick
 * Genetic Algorithm Implementation for reaching a target location
 * Inspired By Dan Shiffman's Coding Train video: Coding Challenge #29: Smart Rockets in p5.js
 * */

//Define Global Variables
var population;
var lifespan = 400; //Max runtime of each generation
var lifeP;
var count = 0;
var target;
var target_size = 20;
var maxForce = 0.5; //"Top Speed"
var obstacles = [];
var finished = 0;
var generation = 0;
var popSize = 500; //How many exist in each generation
var input;
var table;
var pComp;
var plot;
var display_trails = true;
var trail_option;
//Population starting position
var rStartX = 50;
var rStartY = 250;

//Setup Function
function setup() {
	createCanvas(500,700);

	if (location.hash) {
		popSize = int(location.hash.substr(1));
	}
	population = new Population(popSize);
	lifeP = createP();

	//Create the target vector
	target = createVector(500-50, 500/2);

	//Add obstacles to the map
	obstacles.push(new Obstacle(200, 50, 10, 200));
	obstacles.push(new Obstacle(350, 200, 10, 200));

	//Add bounding walls around the canvas
	obstacles.push(new Obstacle(0, 0,500, 5));
	obstacles.push(new Obstacle(0, 0, 5, 500));
	obstacles.push(new Obstacle(500-5, 0, 5, 500));
	obstacles.push(new Obstacle(0, 500-5, 500, 5));

	//Create a table to store data for exporting to CSV
	table = new p5.Table();
	table.addColumn("Population");
	table.addColumn("Generation");
	table.addColumn("Percent Complete");

	//Create Plot object for data visualization
	plot = new Plot(10, 650, 500, 100, "Generation", "Percent Complete");


	//Checkbox to show trails
	trail_option = createCheckbox('Display trails', true);
	trail_option.changed(checkEvent);

	
	//Input to change population size
	
	button = createButton('Change Population Size');
	button.position(0, height);
	button.mousePressed(changePop);

	input = createInput();
	input.position(button.width + 5, height);
	

	//Button to download CSV
	dbutton = createButton('Save Data');
	dbutton.position(button.width + 1.5*input.width, height);
	dbutton.mousePressed(saveData);



}

//Setup Function
function draw() {
	background(255);

	//Run the population
	population.run();
	//Calculate the percent of the population that reached the target
	pComp = (finished/popSize)*100;

	//Display stats about current generation
	lifeP.html("Timer: " + count + "\t\tPopulation: " + popSize+ "\t\tGeneration: " + generation + "\t\tPercent Complete: " + pComp+"%");
	count++;

	//Reset population when its lifespan has expired
	if (count == lifespan) {
		//Evaluate population and select next generation
		population.evaluate();
		population.selection();
		count = 0;
		generation++;
		finished = 0;

		//Record the data to the table
		record();
		

	}
	//Graph Data
	plot.show();
	plot.update(table.getRows());

	//Draw Walls
	fill(255);
	for (var i =0; i < obstacles.length; i++) {
		obstacles[i].show();
	}

	//Draw Target
	fill('red');
	ellipse(target.x, target.y, 2*target_size, 2*target_size);
	fill('yellow');
	ellipse(target.x, target.y, target_size, target_size);
	fill('red');
	ellipse(target.x, target.y, 0.5*target_size, 0.5*target_size);

}

function changePop() {
	var newPop = input.value();
	location.hash = newPop;
	location.reload();
}

function checkEvent() {
	if (this.checked()) {
		display_trails = true;
	}
	else {
		display_trails = false;
	}
}
//Record the data in the table
function record() {
	var newRow = table.addRow();
	newRow.set("Population", popSize);
	newRow.set("Generation", generation);
	newRow.set("Percent Complete", pComp);
}
//Export data to CSV
function saveData() {
	save(table,'data.csv');
}

/*Plot Object
 * (x,y) -> (int) origin coordinates in the canvas
 * (scaleX,scaleY) -> (int) max length of each axis
 * (xVar,yVar) -> (String) Variables that are being plotted*/
function Plot(x, y, scaleX, scaleY, xVar, yVar) {
	//Define an amount of spacing between each point
	this.spacing = 10;
	//Function to display the plot
	this.show = function() {

		//Display axes
		stroke(0);
		line(x,y, x, y - scaleY);
		line(x,y, x + scaleX, y);

		//Add tick marks to axes
		for (var i=this.spacing; i <= scaleX; i+= this.spacing) {
			line(i, y-5, i, y+5);
		}

		for (var i = y - this.spacing; i > y-scaleY; i -= this.spacing) {
			line(x-5, i, x+5, i);
		}

		//Display Title
		textSize(20);
		fill(0);
		text(yVar + " vs. " + xVar, x + (scaleX/4), y + 30);



	}

	//Function to update the plot with new data
	this.update = function(data) {
		colorMode(HSL, 360, 100, 100, 100);

		//Draw the data points as vertices connected by a line
		noFill();
		beginShape();
		vertex(x,y);
		for (var i = 0; i < data.length; i++) {
			var px = data[i].get(xVar);
			var py = data[i].get(yVar);
			vertex(this.spacing*px, y-py);

			/*Uncomment this and comment out the above line to 
			 * change to discrete plot
			 *fill(color(230, 70, 50, 50));
			 *ellipse(this.spacing*px , y-py , 5, 5);
			*/
		}
		endShape();
		
		
	}
}

/*Obstacle Object
 * (x,y) -> (int) coordinates of upper corner of rectangular obstacle
 * (w,h) -> (int) dimensions of rectangular obstacle*/
function Obstacle(x, y, w, h) {
	//Function to display obstacles
	this.show = function() {
		fill(0);
		noStroke();
		rect(x,y,w,h);
	}

	//Accessor Functions
	this.getX = function() {
		return x;
	}
	this.getY = function() {
		return y;
	}
	this.getW = function() {
		return w;
	}
	this.getH = function() {
		return h;
	}

}

/*Population Object
 * (pop) -> Size of the population*/
function Population(pop) {
	this.rockets = [];
	this.popsize = pop;
	this.matingpool = [];
	//Initialize rockets in population
	for(var i = 0; i < this.popsize; i++) {
		this.rockets[i] = new Rocket();
	}
	//Update and display rockets
	this.run = function() {
		for(var i = 0; i < this.popsize; i++) {
			this.rockets[i].update();
			this.rockets[i].show();

		}
	}

	//Determine fitness of each rocket and add to mating pool
	this.evaluate = function() {

		var maxfit = 0;
		//Determine the fitness of each rocket and find the max fit
		for (var i = 0; i < this.popsize; i++) {
			this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxfit) {
				maxfit = this.rockets[i].fitness;

			}
		}

		//Normalize the fitnesses
		for (var i = 0; i < this.popsize; i++) {
			this.rockets[i].fitness /= maxfit;
		}

		this.matingpool = [];
		
		/*Add rockets to a mating pool
		 * Each rocket is added n times, where n is proportional to their fitness*/
		for (var i = 0; i < this.popsize; i++) {
			var n = this.rockets[i].fitness * 100;
			for (var j =0; j < n; j++) {
				this.matingpool.push(this.rockets[i]);

			}
		}

	}
	
	//Select rockets for the next generation based on fitness
	this.selection = function() {
		var newRockets = [];
		//Determine two parent rockets and cross their genes
		for (var i=0; i < this.rockets.length; i++) {
			var parentA = random(this.matingpool).dna;
			var parentB = random(this.matingpool).dna;
			var child = parentA.crossover(parentB);

			//Implement chance of random mutation
			child.mutation();

			newRockets[i] = new Rocket(child);
		}
		this.rockets = newRockets;
	}



}
/*DNA Object
 * (genes) -> (Array) -> Vectors that determine the movement of the rockets*/
function DNA(genes) {
	//If genes are supplied, use them
	if (genes) {
		this.genes = genes;
	}
	//Otherwise, start from scratch
	else {
		this.genes = []
		//Create random genes scaled to maxForce
		for (var i = 0; i < lifespan; i++){
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxForce);
		}
	}

	//Combine the genes of a rocket and its partner to create a child
	this.crossover = function(partner) {
		var newGenes = [];
		//Select a random midpoint
		var mid = floor(random(this.genes.length));
		
		//Create a new set of genes from a combination of both parents
		for (var i = 0; i < this.genes.length; i++) {
			if (i>mid) {
				newGenes[i] = this.genes[i];	
			}
			else {
				newGenes[i] = partner.genes[i];
			}
			

		}
		return new DNA(newGenes);

	}

	//Implement chance of random mutation
	this.mutation = function() {
		for (var i =0; i < this.genes.length ;i++) {
			//Very rarely randomize a gene 
			if (random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	}
	

}
/*Rocket Object
 * (dna) -> DNA Object for the rocket */
function Rocket(dna) {
	//Starting Position of the rockets
	this.pos = createVector(rStartX, rStartY);
	this.vel = createVector();
	this.acc = createVector();
	this.fitness = 0;
	this.completed = false;
	this.crashed = false;

	//Trail of vectors to draw
	this.history = [];

	//Give each rocket a random shade of blue
	colorMode(HSL, 360, 100, 100, 100);
	this.color = color(random(180,275), random(50,100), random(20,70), 50);
	//If dna is provided, use it
	if (dna) {
		this.dna = dna;
	}
	//Otherwise, start from scratch
	else {
		this.dna = new DNA();
	}

	//Physics Engine for rocket movement

	/*Accelerate Rocket
	 * (force)-> Vector to add to the rocket's current heading*/	
	this.applyForce = function(force) {
		this.acc.add(force);
	}


	//Update the state of the rocket
	this.update = function() {

		//Find the distance from the rocket and the target
		var d = dist(this.pos.x,this.pos.y,target.x,target.y);
		//Mark as completed if the rocket reaches the target
		if (d < target_size) {
			if (this.completed == false) {
				finished++;
			}
			this.completed = true;
			this.pos = target.copy();
		} 

		//Collision between rockets and obstacles
		for (var i = 0; i < obstacles.length; i++) {
			rx = obstacles[i].getX();
			ry = obstacles[i].getY();
			rw = obstacles[i].getW();
			rh = obstacles[i].getH();
			if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry &&
				this.pos.y < ry+rh) {
				this.crashed = true;
			}
		}


		//Direct the rocket based on its genes
		this.applyForce(this.dna.genes[count]);
		if (!this.complete && !this.crashed) {
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.vel.limit(4);
			//Add previous locations to history trail
			if (count % 6 == 0) {
				this.history.push(createVector(this.pos.x,this.pos.y));
				
			}
		}

	}

	//Display the rockets and optionally their path
	this.show = function() {
		//Display rocket and rotate based on heading
		push();
		noStroke();
		fill(this.color);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		rect(0,0, 25,5);
		pop();

		//Display trail if checkbox is checked
		if (display_trails) {
			noFill();
			stroke(this.color);
			beginShape();
			for (var i=0; i < this.history.length; i++) {
				var p = this.history[i];
				vertex(p.x, p.y);
			}
			endShape();
		}
	
	}

	//Determine the fitness of the rocket upon completion/crash
	this.calcFitness = function() {
		//Calculate distance from target using the Distance Formula
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);

		//Calculate distance from the target using Manhattan distance
		//var d = abs(this.pos.x - target.x) + abs(this.pos.y - target.y);

		//Invert the fitness -> distance of 0 gives a fitness of 500
		this.fitness = map(d, 0, 500, 500, 0);

		//Bonus for reaching the target - Alter value for testing
		if (this.completed) {
			this.fitness *= 1000;
		}

		//Penalty for crashing into an obstacle - Alter value for testing
		if (this.crashed) {
			this.fitness /= 100
		}

	}
}
