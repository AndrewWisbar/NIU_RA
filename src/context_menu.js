
const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
const highlight_text = document.querySelector(".caption-text");

let menu_selection;

let highlights = [];
let is_highlighted = [];

let rename_rect;

const display_string = highlight_text.innerHTML;
var characters = display_string.split(''); //split the innerHTML into each char

const start_tag = '<span id="char_';
const bracket = '">';
const end_tag = "</span>";
let inner_string = "";

for(var i = 0; i < characters.length; i++) {
    //create a span for each character in the string
    inner_string += (start_tag + i + bracket + characters[i] + end_tag);
    is_highlighted[i] = false;
}

highlight_text.innerHTML = inner_string; // replace the original string




scope.addEventListener("contextmenu", (event) => {
    hide_context_menu();
    menu_selection = null;
    event.preventDefault();
    if(RegExp('char_\d*').test(event.target.id)) {
        document.getElementById("hilite_btn").classList.add("visible");
        document.getElementById("unhilite_btn").classList.add("visible");
        document.getElementById("unlink_word_btn").classList.add("visible");    
        if(RegExp('char_\d*').test(event.target.parentNode.id))
            menu_selection = event.target.parentNode;
        else
            menu_selection = event.target;
    }
    else if(RegExp('rect_\d*').test(event.target.id)) {
        document.getElementById("delete_rect_btn").classList.add("visible");
        document.getElementById("rename_rect_btn").classList.add("visible");
        menu_selection = event.target;
    }
    else if(RegExp('link_\d*').test(event.target.id)) {
        document.getElementById("delete_link_btn").classList.add("visible");
        menu_selection = event.target;
    }
    else {
        return;
    }
    const {clientX: mouseX, clientY: mouseY} = event;

    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    
    contextMenu.classList.add("visible");
});

scope.addEventListener("click", (e) => {
    if(e.target.offsetParent != contextMenu) {
        hide_context_menu();
    }
});

function highlight() {
    var userSelection = window.getSelection();
    is_highlighted.length = 0;
    for (var i = 0; i < characters.length; i++) {
        let node = document.getElementById("char_" + i);
        if(node) {
            if(userSelection.containsNode(node, true)) {
                is_highlighted[i] = true;
                node.classList.add("highlighted-text");
            }
        }
    }
    hide_context_menu();

    group_highlights();
}


function unhighlight() {
    if(menu_selection) {
        var unhighlight_id = menu_selection.id;
        var i = 0;
        while(i < links.length) {
            if(links[i].span === document.getElementById(unhighlight_id))
                links.splice(i, 1);
            else
                i++;
        }

        for(var i = 0; i < highlights.length; i++) {
            if(highlights[i][0].id === unhighlight_id) {
                for(var j = highlights[i].length - 1; j >= 1; j--) {
                    highlights[i][j].classList.remove("highlighted-text");
                    insertAfter(highlights[i][j], highlights[i][0]);
                }

                highlights[i].length = 0;
                highlights.splice(i, 1);

            }
        }
        
        menu_selection.setAttribute("draggable", "false");
        menu_selection.classList.remove("highlighted-text");
        menu_selection.removeEventListener("dragstart", dragstart_handler);
        menu_selection = null;
        write_links();
    }
    hide_context_menu();
}

function unlink_word() {
    if(menu_selection) {
        var unhighlight_id = menu_selection.id;

        var unlink_span = document.getElementById(unhighlight_id);

        let i = 0;
        while(i < links.length) {
            if(links[i].span === unlink_span) {
                links.splice(i, 1);
            }
            else {
                i++;
            }
        }
        menu_selection = null;
        write_links();
    }
    hide_context_menu();
}

function group_highlights() {
    let highlight_chunk = [];

    for(var i = 0; i < characters.length; i++) {
        if(is_highlighted[i]) {
            highlight_chunk.length = 0;

            while(is_highlighted[i] && i < characters.length) {
                let node = document.getElementById("char_" + i);
                highlight_chunk.push(node);
                i++;
            }
            highlights.push(highlight_chunk);
        }
    }

    for(var i = 0; i < highlights.length; i++) {
        highlights[i][0].setAttribute("draggable", true);
        highlights[i][0].addEventListener("dragstart", dragstart_handler);
        for(var j = 1; j < highlights[i].length; j++) {
            highlights[i][0].appendChild(highlights[i][j]);
        }
    }
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function delete_rect() {
    if(menu_selection) {
        let del_index = parseInt(menu_selection.id.match(/\d+/),10);
        regions.splice(del_index, 1);
        var i = 0;
        while(i < links.length) {
            if(links[i].rect === menu_selection) {
                delete links[i].rect;
                links.splice(i, 1);
            }
            else {
                i++;
            }
        }
        menu_selection = null;
        

        var deleted_rect = document.getElementById("rect_" + del_index);
        deleted_rect.remove();
        let children = svg_cont.children;
        for(let i = 0; i < children.length; i++) {
            children[i].setAttribute("id", "rect_" + i);
            regions[i].rectUpdate(children[i]);
        }

        end_draw();
    }

    hide_context_menu();
    write_links();
    set_corners(-1);
    
}

function delete_link() {
    var index = parseInt(menu_selection.id.match(/\d+/),10);
    links.splice(index, 1);

    menu_selection = null;
    write_links();
    hide_context_menu();
}

function hide_context_menu() {
    contextMenu.classList.remove("visible");
    document.getElementById("hilite_btn").classList.remove("visible");
    document.getElementById("unhilite_btn").classList.remove("visible");
    document.getElementById("unlink_word_btn").classList.remove("visible"); 
    document.getElementById("delete_rect_btn").classList.remove("visible");
    document.getElementById("rename_rect_btn").classList.remove("visible");  
    document.getElementById("delete_link_btn").classList.remove("visible");
}

function start_rename() {
    document.getElementById("rename_controls").classList.add("visible");
    rename_rect = parseInt(menu_selection.id.match(/\d+/),10);
    hide_context_menu();
    menu_selection = null;
}

function set_name() {
    let new_name = document.getElementById("name_input");
    document.getElementById("rename_controls").classList.remove("visible");
    regions[rename_rect].rename(new_name.value);
    set_corners(document.getElementById("rect_" + rename_rect), new_name.value);
    new_name.value = "";
    write_links();

}