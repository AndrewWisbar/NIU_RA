
const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");

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
    var user_selection = window.getSelection().getRangeAt(0);

    var newNode = document.createElement("div");
    newNode.setAttribute(
        "style",
        "background-color: yellow; display: inline;"
    );
    user_selection.surroundContents(newNode);
}