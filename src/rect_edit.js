let edit_flag = false;
let valid_edit = false;

let move_flag = false;
let move_anchor = [0, 0];
let move_start = [0, 0];
let move_offset = [0, 0];

let edit_anchor = [0, 0];
let edit_tlp = [0, 0];
let edit_brp = [0, 0];

let move_rect;
let move_index;

let edit_rect;
let edit_index;

const label_text = document.getElementById("label_text");
const cor_anchor = document.getElementById("corner_anchor");

function set_corners(rect, label) {
    if(rect == -1) {
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

        let children = document.getElementById("corner_cont").children;
        for(let i = 0; i < children.length - 1; i++) {
            children[i].classList.add("marker");
        }

        label_text.innerHTML = "";
        label_text.setAttribute("x", -10);
        label_text.setAttribute("y", -10);
        
    }
    else {

        let box = getRelCoords(rect, document.getElementById("corner_cont"));

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

        let children = document.getElementById("corner_cont").children;
        for(let i = 0; i < children.length - 1; i++) { 
            children[i].classList.remove("marker");
        }

        if(label) {
            label_text.innerHTML = label;
            label_text.setAttribute("x", box.left -5);
            label_text.setAttribute("y", box.top - 10);
        }
    }
}

function begin_edit(id) {

    let children = svg_cont.children;
    for(var i = 0; i < children.length; i++) {
        if(children[i].classList.contains("selected"))
            edit_rect = children[i];
    }
    edit_index = parseInt(edit_rect.id.match(/\d+/),10);
    edit_flag = true;


    let box = getRelCoords(edit_rect, svg_cont);
    
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

    regions[edit_index].rectUpdate(edit_rect);
    set_corners(edit_rect);
    write_links();

    regions[edit_index].check();

    edit_rect = null;
    edit_anchor = [0, 0];
    edit_tlp = [0, 0];
    edit_brp = [0, 0];
}

function begin_move(e) {

    let children = svg_cont.children;
    for(var i = 0; i < children.length; i++) {
        if(children[i].classList.contains("selected"))
            move_rect = children[i];
    }
    move_index = parseInt(move_rect.id.match(/\d+/),10);
    move_flag = true;

    let pos = getMousePos(svg_cont, e);
    let box = getRelCoords(move_rect, svg_cont);
    move_anchor = [pos.x, pos.y];
    move_start = [box.left, box.top];
}

function end_move() {
    regions[move_index].rectUpdate(move_rect);
    set_corners(move_rect);
    write_links();
    move_rect = null;
    move_flag = false;
    move_anchor = [0, 0];
    move_start = [0, 0];
    move_offset = [0, 0];

    regions[move_index].check();
}