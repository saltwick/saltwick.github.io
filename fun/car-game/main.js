
let car;

function setup() {
  createCanvas(800,800);
  angleMode(DEGREES);
  

  car = new Car(200,200);
}
let angle = 0;
let x = 50;
let y = 200;
function draw() {
  background(0,0,0);
  

  if (keyIsDown(UP_ARROW)) {
    car.accelerate();
    
  }
  else {
    car.decelerate();
  }

  car.moveForward();
  

  if (keyIsDown(LEFT_ARROW)) {
    car.accelerateTurnLeft();
    
  }
  else if (keyIsDown(RIGHT_ARROW)) {
    car.accelerateTurnRight();
    
  }
  else {
    car.decelerateTurn();
    
  }
  car.turn();

  if (keyIsDown(DOWN_ARROW)) {
    car.decelerate();
  }

  


  car.draw();

}



class Car {

  
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 25;
    this.speed = 0;
    this.angle = 0;
    this.turnSpeed = 0;
    this.accel = 0.1;
    this.accelTurn = .1;
    
    constrain(this.turnSpeed, 0, 5);
  }

  moveForward() {
    this.x = constrain(this.x + this.speed * cos(this.angle), 0, width);
    this.y = constrain(this.y + this.speed * sin(this.angle),0,height);
    
  }
  
  accelerate() {
    this.speed = constrain(this.speed + this.accel, 0, 5);
  }
  
  decelerate() {
    
    this.speed = constrain(this.speed - 0.5*this.accel, 0, 5);
    

  }

  accelerateTurnRight() {
    this.turnSpeed = constrain(this.turnSpeed + this.accelTurn, -5, 5);
  }
  
  accelerateTurnLeft() {
    this.turnSpeed = constrain(this.turnSpeed - this.accelTurn, -5, 5);
  }

  decelerateTurn() {
    if (this.turnSpeed < 0 ) {
        this.turnSpeed = constrain(this.turnSpeed + 2*this.accelTurn, -5,0);
    }
    else if (this.turnSpeed > 0) {
      this.turnSpeed = constrain(this.turnSpeed - 2*this.accelTurn, 0,5);
    }
  }

  brake() {
    this.x -= this.speed * cos(this.angle);
    this.y -= this.speed * sin(this.angle);
  }


  turn() {

    this.angle += this.turnSpeed;
    
    
  }

  draw() {
    
    translate(this.x,this.y);
    rotate(this.angle);
    fill(66,244,232);
    rectMode(CENTER);
    rect(0,0,100,50);
    fill(255);
    rectMode(CORNER);
    rect(25,-25,25,50)

  }
}
