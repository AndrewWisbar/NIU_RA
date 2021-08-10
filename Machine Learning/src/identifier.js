let img;
let detector;
let colors;

function preload() {
    img = loadImage(document.getElementById("src-img").src);
    detector = ml5.objectDetector('cocossd');
}

function gotDetection(error, results) {
    if(error)
        console.error(error);
    
    console.log(results);

    for(let i = 0; i < results.length; i++) {
        let obj = results[i];
        let c = colors[i % colors.length];
        stroke(c);
        strokeWeight(4);
        noFill();
        rect(obj.normalized.x * width, obj.normalized.y * height, obj.normalized.width * width, obj.normalized.height * height);

        strokeWeight(2);
        textSize(16);
        stroke(0, 0, 0);
        fill(c);
        let conf =round(float(obj.confidence) * 100, 2);
        text(obj.label + " " + conf + '%', obj.normalized.x * width + 5, obj.normalized.y * height + 15);
    }
}

function setup() {
    let set_width = 1024;
    colors = [
        color(0, 0, 0),
        color(255, 0, 0),
        color(0, 255, 0),
        color(255, 255, 0),
        color(0, 0, 255),
        color(255, 0, 255),
        color(0, 255, 255),
        color(255, 255, 255)
    ]
    console.log("ML5.js Version: ", ml5.version);
    let new_height = (img.height / img.width) * set_width;
    createCanvas(set_width, new_height);
    background(51);
    image(img, 0, 0, width, height);
    detector.detect(img, gotDetection);
}

function draw() {
}