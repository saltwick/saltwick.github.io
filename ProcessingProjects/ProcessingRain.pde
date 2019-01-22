
RainDrop[] d = new RainDrop[500];
void setup(){
 
  size(1000,750);
    for(int i=0;i < d.length; i++){
      d[i] = new RainDrop();
  }
}

void draw(){
  background(135,206,250);
  for(int i=0;i < d.length; i++){
      d[i].fall();
      d[i].show();
  }
  


}

class RainDrop{
 float x = random(width);
 float y = random(-500,-200);
 float z = random(0,20);
 float yspeed = map(z,0,20,2,10);
 float len = map(z,0,20,5,20);
 float thickness = map(z,0,20,1,3);
 float gravity = map(z,0,20,.05,.1);
 void fall(){
   y = y+yspeed;
   yspeed=yspeed+gravity;
   if(y > height){
    y= random(-500,-200);
    yspeed = map(z,0,20,2,10);
   }
 }
 
 void show(){
   strokeWeight(thickness);
   stroke(0,0,255);
   line(x,y,x,y+len);
 }
  

  
  
  
  
  
}
