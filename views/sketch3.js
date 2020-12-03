/**
* boards in line
*
* @author aadebdeb
* @date 2017/01/26
*/

function setup(){
    var canvas = createCanvas(640, 480);    
    rectMode(CENTER);
    fill(20);
    stroke(255, 251, 249);
    strokeWeight(4);
  }
  
  function draw(){
    background(255, 251, 249);
    translate(width / 2, height / 2);
     num = 10;
     intervalX = map(mouseX, 0, width, 40, -40);
     intervalY = map(abs(mouseX - width / 2), 0, width / 2, 0, -20);
     rectX = 100;
     rectY = 200;
     tilt = map(mouseX, 0, width, -20, 20);
    for( i = num - 1; i > 0; i--){
      push();
       rhytm = map(pow(abs(sin(frameCount * 0.03 - i * 0.3)), 50), 0, 1, 0, -50)
                  * map(abs(mouseX - width / 2), 0, width / 2, 0, 1);
      translate(intervalX * (i - num / 2.0), intervalY * (i - num / 2.0) + rhytm);
      beginShape();
      vertex(-rectX / 2.0, -rectY / 2.0 + tilt);
      vertex(rectX / 2.0, -rectY / 2.0 - tilt);
      vertex(rectX / 2.0, rectY / 2.0 - tilt);
      vertex(-rectX / 2.0, rectY / 2.0 + tilt);
      endShape(CLOSE);
      pop();
    }
  }