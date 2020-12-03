// By Roni Kaufman

let kMax;
let step;
let n = 50; // number of blobs
let radius = 80; // diameter of the circle
let inter = 0.05; // difference between the sizes of two blobs
let maxNoise = 400;

let noiseProg = (x) => (x*x);

function setup() {
  can = createCanvas(600, 600);
  can.parent('d')
  colorMode(HSB, 1);
	angleMode(RADIANS);
  noFill();
	noLoop();
	kMax = random(0.5, 1);
	step = 0.09;
}

function draw() {
   
  for (let i = 0; i < n; i++) {
		let alpha = 1 - noiseProg(i / n);
		stroke(0, alpha);
		let size = radius + i * inter;
		let k = kMax * sqrt(i/n);
		let noisiness = maxNoise * noiseProg(i / n);
    blob(size, width/2, height/2, k, i * step, noisiness);
  }
}

function blob(size, xCenter, yCenter, k, t, noisiness) {
  beginShape();
	let angleStep = PI / 100;
  for (let theta = 0; theta < 2*PI + 0.05; theta += angleStep) {
    let r1, r2;
		r1 = cos(theta)+1;
		r2 = sin(theta)+1;
    let r = size + noise(k * r1,  k * r2, t) * noisiness;
    let x = xCenter + r * cos(theta);
    let y = yCenter + r * sin(theta);
    curveVertex(x, y);
  }
  endShape(CLOSE);
}