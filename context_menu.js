
const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
const highlight_text = document.querySelector(".special-text");

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
    for (var i = 0; i < characters.length; i++) {
        let node = document.getElementById("char_" + i);
        if(userSelection.containsNode(node, true)) {
            node.classList.add("highlighted-text");
            is_highlighted[i] = true;
        }
    }
    console.log(is_highlighted);
    contextMenu.classList.remove("visible");
}


function unhighlight() {
    var userSelection = window.getSelection();
    for (var i = 0; i < characters.length; i++) {
        let node = document.getElementById("char_" + i);
        if(userSelection.containsNode(node, true)) {
            node.classList.remove("highlighted-text");
            is_highlighted[i] = false;
        }
    }
    console.log(is_highlighted);
    contextMenu.classList.remove("visible");
}

function group_highlights() {
    let highlight_chunk = [];
    highlights = [];

    for(var i = 0; i < characters.length; i++) {
        if(is_highlighted[i]) {
            if(highlights[0])
                highlight_chunk.splice(0, highlight_chunk.length);
            else
                highlight_chunk = [];
            
            while(is_highlighted[i] && i < characters.length) {
                let node = document.getElementById("char_" + i);
                highlight_chunk.push(node);
                i++;
            }

            highlights.push(highlight_chunk);
        }
    }

    for(var i = 0; i < highlights.length; i++) {
        let new_parent = document.createElement("span");
        new_parent.setAttribute("draggable", true);
        new_parent.setAttribute("id", "word_" + i);
        let parent = highlights[i][0].parentNode;
        for(var j = 0; j < highlights[i].length; j++) {
            new_parent.appendChild(highlights[i][j]);
        }

        parent.insertBefore(new_parent, document.getElementById("special-text"));
    }
}