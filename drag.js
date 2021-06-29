
let links = [];

function dragstart_handler(ev) {
    var target_el;
    if (RegExp('char_\d*').test(ev.target.parentNode.parentNode.id))
        target_el = ev.target.parentNode.parentNode;  
    else if (RegExp('char_\d*').test(ev.target.parentNode.id))
        target_el = ev.target.parentNode;
    else
        target_el = ev.target;
    ev.dataTransfer.setData("text/plain", target_el.id);
    
}


function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "link";
}

function drop_handler(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text/plain");
    var word = document.getElementById(data).innerText;
    
    console.log(ev.target.id, 'has been linked to the word "', word, '"');
    ev.target.classList.remove('dragging');
    var index = parseInt(ev.target.id.match(/\d+/),10);

    var i = 0;
    while(i < links.length) {
        if(links[i].region.id === ev.target.id) {
            links.splice(i, 1);
            console.log("Old link removed");

        }
        else if(links[i].word === word) {
            links.splice(i, 1);
            console.log("Old link removed");
        }
        else {
            i++;
        }
    }

    links.push(new word_link(regions[index], word));

    console.log(links);
}