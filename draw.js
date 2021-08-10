
// Setting up page elements that we need
const base_img = document.querySelector('.base-img');
const svg_cont = document.querySelector('.svg_cont');
const pre_canvas = document.querySelector('.preview-canvas');
const pre_ctx = pre_canvas.getContext('2d');

window.addEventListener('resize', resizeSVG);

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

let active_rect;
let regions = [];

let label;

let corners = [];
for(var i = 0; i < 4; i++) {
    corners.push(document.getElementById("corner_" + i));
}

corners.push(document.getElementById("center"));

/******************************************************************************
 ****************************Function Definitions******************************
 *****************************************************************************/

svg_cont.onload = function() {
    let img_box = base_img.getBoundingClientRect();
    svg_cont.setAttribute("height", img_box.height);
    svg_cont.setAttribute("width", img_box.width);
}

function resizeSVG() {
    let oldWidth = svg_cont.clientWidth;
    let oldHeight = svg_cont.clientHeight;
    svg_cont.setAttribute("height", base_img.clientHeight);
    svg_cont.setAttribute("width", base_img.clientWidth);
    let widthAdj = oldWidth / base_img.clientWidth;
    let heightAdj = oldHeight / base_img.clientHeight;

    let children = svg_cont.children;
    for(let i = 0; i < children.length; i++) {
        let oldX = parseFloat(children[i].getAttribute("x"));
        let oldY = parseFloat(children[i].getAttribute("y"));

        let oldW = parseFloat(children[i].getAttribute("width"));
        let oldH = parseFloat(children[i].getAttribute("height"));

        children[i].setAttribute("x", oldX / widthAdj);
        children[i].setAttribute("y", oldY / heightAdj);
        children[i].setAttribute("width", oldW / widthAdj);
        children[i].setAttribute("height", oldH / heightAdj);
        regions[i].adjUpdate();
        regions[i].rectUpdate(children[i]);

        if(children[i].classList.contains("selected"))
            select_rect(children[i]);

        
    }
    write_links();
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

        active_rect = document.createElementNS(svgns, "rect");
    }
}

function mouse_move(event) {
    let pos = getMousePos(svg_cont, event);

    if(pos.x < 0)
        pos.x = 0;
    if(pos.x > svg_cont.clientWidth)
        pos.x = svg_cont.clientWidth;
    if(pos.y < 0)
        pos.y = 0;
    if(pos.y > svg_cont.clientHeight)
        pos.y = svg_cont.clientHeight;
    if(draw_flag) { //if we've begun drawing
        
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
    
       
        let box = getRelCoords(edit_rect, svg_cont);
        regions[edit_index].update(box.left, box.top, box.right, box.bottom);
    }


    if(move_flag) {
        let rect_h = move_rect.getAttribute("height")/2;
        let rect_w = move_rect.getAttribute("width")/2;

        if(pos.x > svg_cont.clientWidth - rect_w)
            pos.x = svg_cont.clientWidth - rect_w;
        else if(pos.x < rect_w)
            pos.x = rect_w;

        if(pos.y < rect_h)
            pos.y = rect_h;
        else if(pos.y > svg_cont.clientHeight - rect_h)
            pos.y = svg_cont.clientHeight - rect_h;

        move_offset = [move_anchor[0] - pos.x, move_anchor[1] - pos.y];
        let box = getRelCoords(move_rect, svg_cont);
        regions[move_index].update(box.left, box.top, box.right, box.bottom);
    }
}

function end_draw() {
    if(draw_flag) {
        if(valid_selection) {
            
            regions.push(new selected_region(top_left_point[0], top_left_point[1], 
                                bottom_right_point[0], bottom_right_point[1], active_rect.id));
            active_rect.classList.add("finished_rect");
            active_rect.setAttribute("onmouseover", "select_rect(this)");
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

    if(move_flag) {
        end_move();
    }

    active_rect = null;
}


function reset_image() {
    removeAllChildren(svg_cont);
    removeAllChildren(line_cont);

    regions.splice(0, regions.length);
    links.splice(0, links.length);
    pre_ctx.clearRect(0, 0, pre_canvas.width, pre_canvas.height);
    write_links();
    set_corners(-1);

}

function removeAllChildren(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


function draw() {
    if((draw_flag && prev_point)) {

        if(!rectangle_created) {
            createRect(svg_cont.childElementCount, active_rect);
        }
        active_rect.setAttribute("x", top_left_point[0]);
        active_rect.setAttribute("y", top_left_point[1]);
        active_rect.setAttribute("width", bottom_right_point[0] - top_left_point[0]);
        active_rect.setAttribute("height", bottom_right_point[1] - top_left_point[1]);

        svg_cont.appendChild(active_rect);
        
        prev_point = false;
    }

    if(edit_flag && valid_edit) {
        edit_rect.setAttribute("x", edit_tlp[0]);
        edit_rect.setAttribute("width", edit_brp[0] - edit_tlp[0]);
        edit_rect.setAttribute("y", edit_tlp[1]);
        edit_rect.setAttribute("height", edit_brp[1] - edit_tlp[1]);
        regions[edit_index].check();
        set_corners(edit_rect, regions[edit_index].name);
        write_links();
    }

    if(move_flag) {
        move_rect.setAttribute("x", move_start[0] - move_offset[0]);
        move_rect.setAttribute("y", move_start[1] - move_offset[1]);

        
        regions[move_index].check();
        set_corners(move_rect, regions[move_index].name);
        write_links();
    }

    requestAnimationFrame(draw);
}

function select_rect(selected) {

    if(!(edit_flag || draw_flag || move_flag)) {
        let index = parseInt(selected.id.match(/\d+/),10);

        let children = svg_cont.children;
        for(var i = 0; i < children.length; i++) {
            children[i].classList.remove("selected");
        }

        selected.classList.add("selected");

        label = regions[index].name;

        set_corners(selected, label);

        regions[index].check();
    }
}

function createRect(ind, rect) {
    let rect_id = "rect_" + ind;
    rect.setAttribute("fill", colorPicker.value);
    rect.setAttribute("stroke-width", sizePicker.value);
    rect.setAttribute("stroke", colorPicker.value);
    rect.setAttribute("fill-opacity", 0);
    rect.setAttribute("id", rect_id);
    rect.setAttribute('ondrop', "drop_handler(event)");
    rect.setAttribute('ondragover', "dragover_handler(event)");
    rect.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.target.classList.add('dragging');
    });

    rect.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.target.classList.remove('dragging');
    });
    rectangle_created = true;
}


//call draw to start recursion
draw();



