let edit_flag = false;
let valid_edit = false;

let edit_anchor = [0, 0];
let edit_tlp = [0, 0];
let edit_brp = [0, 0];


function set_corners(index) {
    if(index == -1) {
        corners[0].setAttribute("x", -10);
        corners[0].setAttribute("y", -10);

        corners[1].setAttribute("x", -10);
        corners[1].setAttribute("y", -10);

        corners[2].setAttribute("x", -10);
        corners[2].setAttribute("y", -10);

        corners[3].setAttribute("x", -10);
        corners[3].setAttribute("y", -10);
    }
    else {

        let box = getRelCoords(rectangles[index], document.getElementById("main_container"));

        corners[0].setAttribute("x", (box.left) - 5);
        corners[0].setAttribute("y", (box.top) - 5);

        corners[1].setAttribute("x", (box.right) - 5);
        corners[1].setAttribute("y", (box.top) - 5);

        corners[2].setAttribute("x", (box.left) - 5);
        corners[2].setAttribute("y", (box.bottom) - 5);

        corners[3].setAttribute("x", (box.right) - 5);
        corners[3].setAttribute("y", (box.bottom) - 5);
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