
const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
const highlight_text = document.querySelector(".special-text");

let unhighlight_selection;

let highlights = [];
let is_highlighted = [];

const display_string = highlight_text.innerHTML;
var characters = display_string.split(''); //split the innerHTML into each char

let start_tag = '<span id="char_';
let bracket = '">';
let end_tag = "</span>";
let inner_string = "";

for(var i = 0; i < characters.length; i++) {
    //create a span for each character in the string
    inner_string += (start_tag + i + bracket + characters[i] + end_tag);
    is_highlighted[i] = false;
}

highlight_text.innerHTML = inner_string; // replace the original string




scope.addEventListener("contextmenu", (event) => {

    event.preventDefault();
    if(RegExp('char_\d*').test(event.target.id))
        if(RegExp('char_\d*').test(event.target.parentNode.id))
            unhighlight_selection = event.target.parentNode;
        else
            unhighlight_selection = event.target;

    const {clientX: mouseX, clientY: mouseY} = event;

    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;

    contextMenu.classList.add("visible");
});

scope.addEventListener("click", (e) => {
    if(e.target.offsetParent != contextMenu) {
        contextMenu.classList.remove("visible");
    }
});

function highlight() {
    var userSelection = window.getSelection();
    is_highlighted.length = 0;
    for (var i = 0; i < characters.length; i++) {
        let node = document.getElementById("char_" + i);
        if(node) {
            if(userSelection.containsNode(node, true)) {
                node.classList.add("highlighted-text");
                is_highlighted[i] = true;
            }
        }
    }
    contextMenu.classList.remove("visible");

    group_highlights();
}


function unhighlight() {
    var unhighlight_id = unhighlight_selection.id;

    var unhighlight_text = document.getElementById(unhighlight_id).innerText;

    for(var i = 0; i < links.length; i++) {
        if(links[i].word === unhighlight_text) {
            links.splice(i, 1);
        }
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
    
    unhighlight_selection.setAttribute("draggable", "false");
    unhighlight_selection.classList.remove("highlighted-text");
    unhighlight_selection.removeEventListener("dragstart", dragstart_handler);

    write_links();
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