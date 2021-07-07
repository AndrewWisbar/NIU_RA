
let links = [];
const line_cont = d3.select('#line_cont');

const link_list = document.getElementById("link-list");

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
    var span = document.getElementById(data);
    var word = span.innerText;

    console.log(ev.target.id, 'has been linked to the word "', word, '"');
    ev.target.classList.remove('dragging');
    var index = parseInt(ev.target.id.match(/\d+/),10);

    var i = 0;
    while(i < links.length) {
        if(links[i].region.id === ev.target.id) {

            links.splice(i, 1);

        }
        else if(links[i].word === word) {
            links.splice(i, 1);
        }
        else {
            i++;
        }
    }

    links.push(new word_link(regions[index], word, rectangles[index], span));

    write_links();
}


function write_links() {

    link_list.innerHTML = '';
    line_cont.html("");
    for(var i = 0; i < links.length; i++) {
        let item = document.createElement("li");
        item.innerHTML = links[i].region.id + ' is linked to the word "' + links[i].word + '"';
        
        let span_offset = getCoords(links[i].span);
        let rect_offset = getCoords(links[i].rect);
        
        let path = get_path(span_offset, rect_offset, 12);
        link_list.appendChild(item);
        line_cont.append('path')
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("stroke-dasharray", "5,5")
            .style("fill", "none")
            .attr("d", path);      
    }
}

function get_path(start, end, intensity) {

    let parent_box = getCoords(document.getElementById("main_container"));
    var new_path = d3.path();
    new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.bottom - parent_box.top);
    new_path.bezierCurveTo(start.left - parent_box.left, 
                            end.top - parent_box.top, 
                            end.right - parent_box.left, 
                            end.top- parent_box.top, 
                            end.right - parent_box.left,
                            end.top- parent_box.top);

    return new_path;
}



function getCoords(elem) {
    let box = elem.getBoundingClientRect();
    return {
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      left: box.left
    };
}

function getRelCoords(elem, elem_2) {
    let box = elem.getBoundingClientRect();
    let box_2 = elem_2.getBoundingClientRect();
    return {
      top: box.top - box_2.top,
      right: box.right - box_2.left,
      bottom: box.bottom - box_2.top,
      left: box.left - box_2.left
    };
}


function get_parents_bounds(elem) {

    let adj_left = 0;
    let adj_top = 0;
    let node = elem;

    while(node.parentNode != document.body) {
        let node_box = node.getBoundingClientRect();

        adj_left += node_box.left;
        adj_top += node_box.top;
        node = node.parentNode;
    }

    return {
        top: adj_top,
        left: adj_left
    };
}

