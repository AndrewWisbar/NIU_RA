
// Setting up page elements that we need
const canvas = document.querySelector('.draw-canvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.querySelector('input[type="color"]');
const sizePicker = document.querySelector('input[type="range"]');

//Global Variables
let draw_flag = false;
let prev_point = false;
let curX;
let curY;
let prevX;
let prevY;

let picture = new Image();
picture.src = 'https://www.niu.edu/locations/images/dekalb.jpg';

const width = canvas.width = 1000;
const height = canvas.height = 1000;

ctx.fillStyle = 'rgb(50, 50, 50)';
ctx.fillRect(0, 0, width, height);


picture.onload = function() {

    // set height of canvas based on aspect ratio
    canvas.height = canvas.width * (picture.height / picture.width);
    ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
}

function begin_draw() {
    draw_flag = true;
}

function end_draw() {
    draw_flag = false;
    prev_point = false;
}

function mouse_move(event) {
    let pos = getMousePos(canvas, event);

    curX = pos.x;
    curY = pos.y;

}

function reset_image() {
    ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
}

function draw() {
    if(draw_flag && prevX != curX && prevY != curY) {
        if(prev_point) {
            ctx.strokeStyle = colorPicker.value;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(curX, curY);
            ctx.lineWidth = sizePicker.value;
            ctx.stroke();
        }

        
        prev_point = true;
        prevX = curX;
        prevY = curY;

        console.log(curX, curY);
    }

    requestAnimationFrame(draw);
}

function degToRad(deg) {
    var pi = Math.PI;
    return deg * (pi / 180);
}

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

draw();