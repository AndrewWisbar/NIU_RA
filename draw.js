
const canvas = document.querySelector('.drawCanvas');
const width = canvas.width = 950;
const height = canvas.height = 475;

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'rgb(50, 50, 50)';
ctx.fillRect(0, 0, width, height);

const colorPicker = document.querySelector('input[type="color"]');
const sizePicker = document.querySelector('input[type="range"]');
let draw_flag = false;
let prev_point = false;
let curX;
let curY;
let prevX;
let prevY;

let picture = new Image();
picture.src = 'https://www.niu.edu/locations/images/dekalb.jpg';




picture.onload = function() {
    ctx.drawImage(picture, 0, 0);
}

function begin_draw() {
    draw_flag = true;
}

function end_draw() {
    draw_flag = false;
    prev_point = false;
}

function mouse_move(event) {
    curX = (window.Event) ? event.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    curY = (window.Event) ? event.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}

function reset_image() {
    ctx.drawImage(picture, 0, 0);
}

function draw() {
    if(draw_flag) {
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
    }

    requestAnimationFrame(draw);
}

function degToRad(deg) {
    var pi = Math.PI;
    return deg * (pi / 180);
}

draw();