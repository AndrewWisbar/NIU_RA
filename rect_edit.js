let edit_flag = false;
let valid_edit = false;

let move_flag = false;
let move_anchor = [0, 0];
let move_start = [0, 0];
let move_offset = [0, 0];

let edit_anchor = [0, 0];
let edit_tlp = [0, 0];
let edit_brp = [0, 0];

const cor_anchor = document.getElementById("corner_anchor");

function set_corners(index, label) {
    if(index == -1) {
        corners[0].setAttribute("x", -10);
        corners[0].setAttribute("y", -10);

        corners[1].setAttribute("x", -10);
        corners[1].setAttribute("y", -10);

        corners[2].setAttribute("x", -10);
        corners[2].setAttribute("y", -10);

        corners[3].setAttribute("x", -10);
        corners[3].setAttribute("y", -10);

        corners[4].setAttribute("x", -10);
        corners[4].setAttribute("y", -10);
    }
    else {

        let box = getRelCoords(rectangles[index], document.getElementById("corner_cont"));

        corners[0].setAttribute("x", (box.left) - 5);
        corners[0].setAttribute("y", (box.top) - 5);

        corners[1].setAttribute("x", (box.right) - 5);
        corners[1].setAttribute("y", (box.top) - 5);

        corners[2].setAttribute("x", (box.left) - 5);
        corners[2].setAttribute("y", (box.bottom) - 5);

        corners[3].setAttribute("x", (box.right) - 5);
        corners[3].setAttribute("y", (box.bottom) - 5);

        corners[4].setAttribute("x", (box.left + box.right) / 2 - 5);
        corners[4].setAttribute("y", (box.top + box.bottom) / 2 - 5);
    }
}

function begin_edit(id) {
    edit_flag = true;
    let box = getRelCoords(rectangles[selected_rect], document.getElementById("svg_cont"));
    if(id == "corner_0") {
        edit_anchor = [box.right, box.bottom];
        
    }
    else if(id == "corner_1") {
        edit_anchor = [box.left, box.bottom];
        
    }
    else if(id == "corner_2") {
        edit_anchor = [box.right, box.top];
    }
    else {
        edit_anchor = [box.left, box.top];
    }
    edit_tlp = [box.left, box.top];
    edit_brp = [box.right, box.bottom];
}   

function end_edit() {
    edit_flag = false;

    points = getRelCoords(rectangles[selected_rect], document.getElementById("svg_cont"));

    regions[selected_rect].update(points.left, points.top, points.right, points.bottom);

    regions[selected_rect].check();

    set_corners(selected_rect);

    edit_anchor = [0, 0];
    edit_tlp = [0, 0];
    edit_brp = [0, 0];
}

function begin_move(e) {
    move_flag = true;

    let pos = getMousePos(svg_cont, e);
    let box = getRelCoords(rectangles[selected_rect], svg_cont);
    move_anchor = [pos.x, pos.y];
    move_start = [box.left, box.top];

    console.log(move_anchor);
}

function end_move() {

    points = getRelCoords(rectangles[selected_rect], document.getElementById("svg_cont"));
    move_flag = false;
    move_flag = false;
    move_anchor = [0, 0];
    move_start = [0, 0];
    move_offset = [0, 0];

    regions[selected_rect].update(points.left, points.top, points.right, points.bottom);

    regions[selected_rect].check();
}