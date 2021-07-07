
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
let rectangle_created = false;

//Points used to draw selection rectangle
let anchor_point = [0, 0];
let top_left_point = [0, 0];
let bottom_right_point = [0, 0];

let rectangles = [];
let rect_ind = 0;

let regions = [];

let corners = [];
for(var i = 0; i < 4; i++) {
    corners.push(document.getElementById("corner_" + i));
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

        rectangles.push(document.createElementNS(svgns, "rect"));
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

    if(edit_flag) { //if we're editing
        
        //get the mouse position
        let pos = getMousePos(svg_cont, event);

        //determine the coordinates of the top left and bottom right points
        if(pos.x < edit_anchor[0]) { 
            edit_brp[0] = edit_anchor[0];
            edit_tlp[0] = pos.x;
        }
        else {
            edit_brp[0] = pos.x;
        }

        if(pos.y < edit_anchor[1]) {
            edit_brp[1] = edit_anchor[1];
            edit_tlp[1] = pos.y;
        }
        else {
            edit_brp[1] = pos.y;
        }
    
        valid_edit = true;
    
       set_corners(selected_rect);
    }
}

function end_draw() {
    if(draw_flag) {
        if(valid_selection) {
            regions.push(new selected_region(top_left_point[0], top_left_point[1], 
                                bottom_right_point[0], bottom_right_point[1], rectangles[rect_ind].id));
            //regions[rect_ind].check();
            rectangles[rect_ind].classList.add("finished_rect");
            select_rect(rectangles[rect_ind].getAttribute("id"));

            rect_ind++;
        }

        draw_flag = false;
        prev_point = false;
        valid_selection = false;
        rectangle_created = false;

        anchor_point = [0, 0];
        top_left_point = [0, 0];
        bottom_right_point = [0, 0];
    }    
    
    if(edit_flag) {
        end_edit();
    }
}


function reset_image() {
    removeAllChildren(svg_cont);
    removeAllChildren(line_cont);

    rectangles.splice(0, rectangles.length);
    rect_ind = 0;
    regions.splice(0, regions.length);
    links.splice(0, links.length);
    link_list.innerHTML = '';
    pre_ctx.clearRect(0, 0, pre_canvas.width, pre_canvas.height);

}

function removeAllChildren(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}




function draw() {
    if((draw_flag && prev_point)) {
        if(!rectangle_created) {
            let rect_id = "rect_" + rect_ind;
            rectangles[rect_ind].setAttribute("fill", colorPicker.value);
            rectangles[rect_ind].setAttribute("stroke-width", sizePicker.value);
            rectangles[rect_ind].setAttribute("stroke", colorPicker.value);
            rectangles[rect_ind].setAttribute("fill-opacity", 0);
            rectangles[rect_ind].setAttribute("id", rect_id);
            rectangles[rect_ind].setAttribute("onclick", "select_rect(this.id)");
            rectangles[rect_ind].setAttribute('ondrop', "drop_handler(event)");
            rectangles[rect_ind].setAttribute('ondragover', "dragover_handler(event)");
            rectangles[rect_ind].addEventListener('dragenter', function(e) {
                e.preventDefault();
                e.target.classList.add('dragging');
            });
            
            rectangles[rect_ind].addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.target.classList.remove('dragging');
            });
            rectangle_created = true;
        }
        
        rectangles[rect_ind].setAttribute("x", top_left_point[0]);
        rectangles[rect_ind].setAttribute("y", top_left_point[1]);
        rectangles[rect_ind].setAttribute("width", bottom_right_point[0] - top_left_point[0]);
        rectangles[rect_ind].setAttribute("height", bottom_right_point[1] - top_left_point[1]);

        
        svg_cont.appendChild(rectangles[rect_ind]);
        prev_point = false;
    }

    if(edit_flag && valid_edit) {

        let p_box = getCoords(document.getElementById("main_container"));

        rectangles[selected_rect].setAttribute("x", edit_tlp[0]);
        rectangles[selected_rect].setAttribute("y", edit_tlp[1]);
        rectangles[selected_rect].setAttribute("width", edit_brp[0] - edit_tlp[0]);
        rectangles[selected_rect].setAttribute("height", edit_brp[1] - edit_tlp[1]);

    }

    requestAnimationFrame(draw);
}

function select_rect(clicked_id) {
    var index = parseInt(clicked_id.match(/\d+/),10);

    for(var i = 0; i < rectangles.length; i++) {
        rectangles[i].classList.remove("selected");
    }

    selected_rect = index;
    rectangles[index].classList.add("selected");

    set_corners(index);

    regions[index].check();

}

//call draw to start recursion
draw();



