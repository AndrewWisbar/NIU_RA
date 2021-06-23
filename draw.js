
// Setting up page elements that we need
const base_img = document.querySelector('.base-img');
const svg_cont = document.querySelector('.svg_cont');
const pre_canvas = document.querySelector('.preview-canvas');
const pre_ctx = pre_canvas.getContext('2d');


const svgns = "http://www.w3.org/2000/svg";

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

let rectangles = [];

/******************************************************************************
 ******************************Class Definitions*******************************
 *****************************************************************************/

class selected_region {

    constructor(left, up, right, low) {
        let adj = base_img.naturalWidth / base_img.width
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
        pre_ctx.drawImage(base_img, this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0],
            this.bounds[3] - this.bounds[1], 0, 0,
            pre_canvas.width,
            pre_canvas.height);

        //log the bounds of the selection
        console.log("(", Math.floor(this.bounds[0]), ", ",
            Math.floor(this.bounds[1]), ")  (", 
            Math.floor(this.bounds[2]), ", ", 
            Math.floor(this.bounds[3]), ")");

        console.log(base_img.width, base_img.height);
    }
} 

/******************************************************************************
 ****************************Function Definitions******************************
 *****************************************************************************/

base_img.onload = function() {
    svg_cont.setAttribute("height", base_img.height);
}

function  getMousePos(area, evt) {
    var rect = area.getBoundingClientRect(); // abs. size of element
  
    return {
      x: (evt.clientX - rect.left),   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top)     // been adjusted to be relative to element
    }
}

function begin_draw(event) {
    //protect against user moving mouse off canvas while drawing
    if(!draw_flag) {
        //get the mouse position when the user clicks
        let pos = getMousePos(svg_cont, event);

        //the anchor point will stay constant
        anchor_point = [pos.x, pos.y];

        //the top_left_point will be adjusted 
        //based on the position of the other point
        top_left_point = [pos.x, pos.y];
        
        //allow drawing to begin
        draw_flag = true;

        rectangles[0] = document.createElementNS(svgns, "rect");
    }
}

function mouse_move(event) {
    
    if(draw_flag) { //if we've begun drawing

        //get the mouse position
        let pos = getMousePos(svg_cont, event);
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

/*
function reset_image() {
    ctx.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height);
    pre_ctx.clearRect(0, 0, pre_canvas.width, pre_canvas.height);
}
*/


function draw() {
    if(draw_flag && prev_point) {

        rectangles[0].setAttribute("x", top_left_point[0]);
        rectangles[0].setAttribute("y", top_left_point[1]);
        rectangles[0].setAttribute("width", bottom_right_point[0] - top_left_point[0]);
        rectangles[0].setAttribute("height", bottom_right_point[1] - top_left_point[1]);
        rectangles[0].setAttribute("fill", colorPicker.value);
        rectangles[0].setAttribute("stroke", colorPicker.value);
        rectangles[0].setAttribute("fill-opacity", "0.1");
        
        svg_cont.appendChild(rectangles[0]);
        prev_point = false;
    }

    requestAnimationFrame(draw);
}

//call draw to start recursion
draw();