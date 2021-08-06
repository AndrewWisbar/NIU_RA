
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
    
    ev.target.classList.remove('dragging');
    var index = parseInt(ev.target.id.match(/\d+/),10);

    var i = 0;
    while(i < links.length) {
        if(links[i].rect === document.getElementById(ev.target.id) && links[i].span === span) {

            links.splice(i, 1);

        }
        else {
            i++;
        }
    }

    links.push(new word_link(regions[index], word, ev.target, span));
    select_rect(ev.target);
    write_links();
}


function write_links() {

    link_list.innerHTML = '';
    line_cont.html("");
    let temp = new Array(regions.length);
    for(var i = 0; i < temp.length; i++) {
        temp[i] = new Array(0);
    }

    for(var i = 0; i < links.length; i++) {
        draw_links(i);

        var tmp_i = parseInt(links[i].rect.id.match(/\d+/),10);
        temp[tmp_i].push(links[i].word);
    }

    for(var i = 0; i < temp.length; i++) {
        if(temp[i].length > 1) {
            let item = document.createElement("li");
            item.innerHTML = regions[i].name + ' is linked to the words "';
            for(var j = 0; j < temp[i].length; j++) {
                if(j == temp[i].length - 1) {
                    item.innerHTML += temp[i][j] + '"';
                }
                else if(j == temp[i].length - 2) {
                    item.innerHTML += temp[i][j] + '" and "';
                }
                else {
                    item.innerHTML += temp[i][j] + '", "'
                }
            }

            link_list.appendChild(item);
        }
        else if(temp[i].length == 1) {
            let item = document.createElement("li");
            item.innerHTML = regions[i].name + ' is linked to the word "' + temp[i][0] + '"';
            link_list.appendChild(item);
        }
    }    
}

function get_path(start, end, intensity) {

    let parent_box = getCoords(document.getElementById("line_cont"));
    var new_path = d3.path();
    let range = (end.right < start.left) ? start.left - end.right: start.right - end.left;
    let end_width = (end.right - end.left);


    if(end.right < start.left) { // if end is entirely to the left of the start
        new_path.moveTo(start.left - parent_box.left, (start.top + start.bottom) / 2 - parent_box.top);
        new_path.bezierCurveTo((start.left - (range / 2)) - parent_box.left, 
                                (start.top + start.bottom) / 2 - parent_box.top,
                                (end.right + (range / 2)) - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top,
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top);
    }
    else if(end.right > start.left && (end.right + end.left) / 2 < start.left) { // ends x-range overlaps the starts
        new_path.moveTo(start.left - parent_box.left, (start.top + start.bottom) / 2 - parent_box.top);
        new_path.quadraticCurveTo((end.left + end.right) / 2 - parent_box.left, 
                                    (start.top + start.bottom) / 2 - parent_box.top,
                                    (end.left + end.right) / 2 - parent_box.left,
                                    end.top - parent_box.top);
    }
    else if((end.right + end.left) / 2 > start.left && (end.right + end.left) / 2 < start.right) { // the middle of end is within start
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.bottom - parent_box.top);
        new_path.bezierCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                (start.bottom + end.top) / 2 - parent_box.top,
                                (end.right + end.left) / 2 - parent_box.left,
                                (start.bottom + end.top) / 2 - parent_box.top,
                                (end.right + end.left) / 2 - parent_box.left,
                                end.top - parent_box.top);
    }
    else if((end.left + end.right) / 2 > start.right && end.left < start.right) { 
        new_path.moveTo(start.right - parent_box.left, (start.top + start.bottom) / 2 - parent_box.top);
        new_path.quadraticCurveTo((end.left + end.right) / 2 - parent_box.left, 
                                    (start.top + start.bottom) / 2 - parent_box.top,
                                    (end.left + end.right) / 2 - parent_box.left,
                                    end.top - parent_box.top);
    }
    else {
        new_path.moveTo(start.right - parent_box.left, (start.top + start.bottom) / 2 - parent_box.top);
        new_path.bezierCurveTo((start.right - (range / 2)) - parent_box.left, 
                                (start.top + start.bottom) / 2 - parent_box.top,
                                (end.left + (range / 2)) - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top,
                                end.left - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top); 
    }
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

function draw_links(index) {
    let span_offset = getCoords(links[index].span);
    let rect_offset = getCoords(links[index].rect);

    let path = get_path(span_offset, rect_offset, 12);

    line_cont.append('path')
        .attr("d", path)
        .attr("onmouseover", "highlight_link(event)")
        .attr("onmouseout", "unhighlight_link(event)")
        .attr("id", "link_" + index);
}

function highlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.add("selected_link");
}

function unhighlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.remove("selected_link");
}