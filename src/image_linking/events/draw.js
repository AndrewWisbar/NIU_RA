
// Setting up page elements that we need
const base_img = document.querySelector('#base-img');
const svg_cont = document.querySelector('#svg_cont');
const col_string = "#00FFFF";

const pre_canvas = document.querySelector('.preview-canvas');
const pre_ctx = pre_canvas.getContext('2d');

const rect_stroke = 2;

let rect_control = new rectangle_controller(svg_cont, svgns, base_img, pre_canvas);

const color_codes = [
    // "#2D2D2A",
    "#FF3333",
    "#FF8E72",
    "#F9DB6D",
    "#D6E681",
    "#C9EABC",
    "#BCEDF6",
    "#F7BFB4",
    "#B493A6"
]

let obj_classes = [];

svg_cont.onload = function() {
    let img_box = base_img.getBoundingClientRect();
    svg_cont.setAttribute("width", img_box.width);
    svg_cont.setAttribute("height", img_box.height);
    rect_control.updateSVG(svg_cont);
    
}

window.addEventListener('resize', resizeSVG);

//User interface controls 
const colorPicker = document.querySelector('input[type="color"]');



let img_ind = Math.floor(Math.random() * NUM_IMAGES);
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
    rect_control.begin_draw(event);
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

    rect_control.reset_state();
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

function change_colors() {
    rect_control.set_colors(colorPicker.value);
}


cocoSsd.load().then(model => {
    model.detect(base_img).then(predictions => {
        rect_control.gotDetection(predictions);
    })
})