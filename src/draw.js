
// Setting up page elements that we need
const base_img = document.querySelector('#base-img');
const svg_cont = document.querySelector('#svg_cont');

const pre_canvas = document.querySelector('.preview-canvas');
const pre_ctx = pre_canvas.getContext('2d');

const svgns = "http://www.w3.org/2000/svg";

let rect_control = new rectangle_controller(svg_cont, svgns, base_img, pre_canvas);

svg_cont.onload = function() {
    let img_box = base_img.getBoundingClientRect();
    svg_cont.setAttribute("width", img_box.width);
    svg_cont.setAttribute("height", img_box.height);
    rect_control.updateSVG(svg_cont);
    
}

window.addEventListener('resize', resizeSVG);

//User interface controls 
const colorPicker = document.querySelector('input[type="color"]');
const sizePicker = document.querySelector('input[type="range"]');


let img_num = 8;
let img_ind = Math.floor(Math.random() * img_num);
let img_path = 'images/img000' + img_ind + '.jpg';
base_img.setAttribute('src', img_path);

/******************************************************************************
 ****************************Function Definitions******************************
 *****************************************************************************/


function resizeSVG() {
    rect_control.resizeSVG();
}

function  getMousePos(area, evt) {
    var rect = area.getBoundingClientRect(); // abs. size of element
  
    return {
      x: (evt.clientX - rect.left),   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top)     // been adjusted to be relative to element
    }
}

function begin_draw(event) {
    rect_control.start_draw(event);
}

function begin_edit(e, corner) {
    rect_control.begin_edit(e, corner);
    
}

function begin_move(event) {
    rect_control.begin_move(event);
}

function mouse_move(event) {
    rect_control.mouse_move(event);
}



function end_draw() {
    rect_control.end_draw();
}


function reset_image() {
    removeAllChildren(svg_cont);
    removeAllChildren(line_cont);

    regions.splice(0, regions.length);
    links.splice(0, links.length);
    pre_ctx.clearRect(0, 0, pre_canvas.width, pre_canvas.height);
    write_links();

}

function removeAllChildren(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function select_rect(selected) {
    rect_control.select_rect(selected);
}

function deselect(e) {
    rect_control.deselect();
}

function createRect(ind, rect) {
    rect_control.createRect(ind, rect);
}

// function draw() {
//     if((rect_control.draw_flag && rect_control.prev_point)) {

//         if(!rect_control.rectangle_created) {
//             rect_control.createRect(rect_control.svg.childElementCount, rect_control.active_rect);
//         }
//         rect_control.active_rect.setAttribute("x", rect_control.top_left_point.x);
//         rect_control.active_rect.setAttribute("y", rect_control.top_left_point.y);
//         rect_control.active_rect.setAttribute("width", rect_control.bottom_right_point.x - rect_control.top_left_point.x);
//         rect_control.active_rect.setAttribute("height", rect_control.bottom_right_point.y - rect_control.top_left_point.y);

//         rect_control.svg.appendChild(rect_control.active_rect);
        
//         rect_control.prev_point = false;
//     }

//     if(rect_control.edit_flag && rect_control.valid_edit) {
//         rect_control.edit_rect.svg.setAttribute("x", rect_control.edit_tlp.x);
//         rect_control.edit_rect.svg.setAttribute("width", rect_control.edit_brp.x - rect_control.edit_tlp.x);
//         rect_control.edit_rect.svg.setAttribute("y", rect_control.edit_tlp.y);
//         rect_control.edit_rect.svg.setAttribute("height", rect_control.edit_brp.y - rect_control.edit_tlp.y);
//         rect_control.rects[rect_control.edit_index].check();
//         rect_control.select_rect(rect_control.edit_rect, rect_control.rects[rect_control.edit_index].name);
//         write_links();
//     }

//     if(rect_control.move_flag) {
//         rect_control.move_rect.setAttribute("x", rect_control.move_start.x - rect_control.move_offset.x);
//         rect_control.move_rect.setAttribute("y", rect_control.move_start.y - rect_control.move_offset.y);

        
//         rect_control.rects[rect_control.move_index].check();
//         rect_control.select_rect(rect_control.move_rect);
//         write_links();
//     }

//     requestAnimationFrame(draw);
// }


// draw();