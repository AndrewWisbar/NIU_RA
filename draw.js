
// Setting up page elements that we need
const canvas = document.querySelector('.draw-canvas');
const pre_canvas = document.querySelector('.preview-canvas');
const ctx = canvas.getContext('2d');
const pre_ctx = pre_canvas.getContext('2d');

//User interface controls 
const colorPicker = document.querySelector('input[type="color"]');
const sizePicker = document.querySelector('input[type="range"]');

//Flags to control mouse interaction
let draw_flag = false;
let prev_point = false;
let valid_selection = false;

//Points used to draw selection rectangle
let anchor_point = [0, 0];
let top_left_point = [0, 0];
let bottom_right_point = [0, 0];

//Setting image
let picture = new Image();
picture.src = 'https://www.niu.edu/locations/images/dekalb.jpg';

//Width and height of the canvas (not the actual display size)
const width = canvas.width = 1000;
const height = canvas.height = 1000;

//Setup canvas with blank background
ctx.fillStyle = 'rgb(50, 50, 50)';
ctx.fillRect(0, 0, width, height);


/******************************************************************************
 ******************************Class Definitions*******************************
 *****************************************************************************/

class selected_region {

    constructor(left, up, right, low) {
        //convert between image pixels and canvas pos
        let adj = picture.width / canvas.width; 

        this.bounds = [left * adj, up * adj, right * adj, low * adj];
    }

    // called after a user selects a portion of the image
    check() {
        var ratio;

        //if the width of the selection is greator
        if((this.bounds[2] - this.bounds[0]) > (this.bounds[3] - this.bounds[1])) {
            pre_canvas.width = 1000;

            //get the ratio of width/height
            ratio = pre_canvas.width / (this.bounds[2] - this.bounds[0]);

            //set the height of the canvas to the appropriate size
            pre_canvas.height = pre_canvas.width * ((this.bounds[3] - this.bounds[1]) / (this.bounds[2] - this.bounds[0]));
        } else {
            pre_canvas.height = 1000;

            //get the ratio of height/width
            ratio = pre_canvas.height / (this.bounds[3] - this.bounds[1]);

            //set the width of the canvas based on the ratio
            pre_canvas.width = pre_canvas.height * ((this.bounds[3] - this.bounds[1]) / (this.bounds[2] - this.bounds[0]));
        }

        //draw the image
        pre_ctx.drawImage(picture, this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0],
            this.bounds[3] - this.bounds[1], 0, 0,
            (this.bounds[2] - this.bounds[0]) * ratio,
            (this.bounds[3] - this.bounds[1]) * ratio);

        //log the bounds of the selection
        console.log("(", Math.floor(this.bounds[0]), ", ",
            Math.floor(this.bounds[1]), ")  (", 
            Math.floor(this.bounds[2]), ", ", 
            Math.floor(this.bounds[3]), ")");
    }
} 

/******************************************************************************
 ****************************Function Definitions******************************
 *****************************************************************************/

picture.onload = function() {

    // set height of canvas based on aspect ratio
    canvas.height = canvas.width * (picture.height / picture.width);
    ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
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

function begin_draw(event) {
    //protect against user moving mouse off canvas while drawing
    if(!draw_flag) {
        //get the mouse position when the user clicks
        let pos = getMousePos(canvas, event);

        //the anchor point will stay constant
        anchor_point = [pos.x, pos.y];

        //the top_left_point will be adjusted 
        //based on the position of the other point
        top_left_point = [pos.x, pos.y];
        
        //allow drawing to begin
        draw_flag = true;
    }
}

function mouse_move(event) {
    
    if(draw_flag) { //if we've begun drawing

        //get the mouse position
        let pos = getMousePos(canvas, event);
        prev_point = true; // we now have two points to draw the rectangle

        //determine the coordinates of the top left and bottom right points
        if(pos.x < anchor_point[0]) { 
            bottom_right_point[0] = anchor_point[0];
            top_left_point[0] = pos.x;
        }
        else {
            bottom_right_point[0] = pos.x;
        }

        if(pos.y < anchor_point[1]) {
            bottom_right_point[1] = anchor_point[1];
            top_left_point[1] = pos.y;
        }
        else {
            bottom_right_point[1] = pos.y;
        }

        //we now have a valid selected region
        valid_selection = true;
    }
}

function end_draw() {

    if(valid_selection) {
        let region = new selected_region(top_left_point[0], top_left_point[1], 
                            bottom_right_point[0], bottom_right_point[1]);
        region.check();
    }
    else {
        reset_image();
    }

    draw_flag = false;
    prev_point = false;
    valid_selection = false;

    anchor_point = [0, 0];
    top_left_point = [0, 0];
    bottom_right_point = [0, 0];

}

function reset_image() {
    ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
    pre_ctx.clearRect(0, 0, pre_canvas.width, pre_canvas.height);
}

function draw() {
    if(draw_flag && prev_point) {

        ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = sizePicker.value;
        ctx.beginPath();
        ctx.rect(top_left_point[0], top_left_point[1], 
            bottom_right_point[0] - top_left_point[0], 
            bottom_right_point[1] - top_left_point[1]);
        ctx.stroke();

        prev_point = false;
    }

    requestAnimationFrame(draw);
}

//call draw to start recursion
draw();