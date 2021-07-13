
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
        /*if(links[i].region.id === ev.target.id) {

            links.splice(i, 1);

        }
        else */if(links[i].span === span) {
            links.splice(i, 1);
        }
        else {
            i++;
        }
    }

    links.push(new word_link(regions[index], word, rectangles[index], span));
    select_rect(ev.target.id);
    write_links();
}


function write_links() {

    link_list.innerHTML = '';
    line_cont.html("");
    let temp = new Array(rectangles.length);
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
            item.innerHTML = "rect_" + i + ' is linked to the words "';
            for(var j = 0; j < temp[i].length; j++) {
                if(j == temp[i].length - 1) {
                    item.innerHTML += temp[i][j] + '"';
                }
                else if(j == temp[i].length - 2) {
                    item.innerHTML += temp[i][j] + '" and "';
                }
                else {
                    item.innerHTML += temp[i][j] + '", '
                }
            }

            link_list.appendChild(item);
        }
        else if(temp[i].length == 1) {
            let item = document.createElement("li");
            item.innerHTML = "rect_" + i + ' is linked to the word "' + temp[i][0] + '"';
            link_list.appendChild(item);
        }
    }    
}

function get_path(start, end, intensity) {

    let parent_box = getCoords(document.getElementById("main_container"));
    let svg_box = getCoords(document.getElementById("svg_cont"));
    let text_box = getCoords(document.getElementById("sample-text"));
    let extent = ((start.left + start.right) / 2 + (svg_box.right - end.right)) / 10
    var new_path = d3.path();


    if((end.top + end.bottom) / 2 < start.bottom + 2) { //middle of rect is above top of span
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.top - parent_box.top);
        new_path.quadraticCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                start.top - parent_box.top - 6,
                                text_box.left - parent_box.left,
                                start.top - parent_box.top - 6);

        new_path.bezierCurveTo(svg_box.right - parent_box.left, 
                                start.top - parent_box.top - 6, 
                                svg_box.right - parent_box.left, 
                                (end.top + end.bottom) / 2 - parent_box.top, 
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top); 
    }
    else { // rect is significantly lower than span
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.bottom - parent_box.top);
        new_path.quadraticCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                start.bottom - parent_box.top + 6,
                                text_box.left - parent_box.left,
                                start.bottom - parent_box.top + 6);

        new_path.bezierCurveTo(svg_box.right - parent_box.left, 
                                start.bottom - parent_box.top + 6, 
                                svg_box.right - parent_box.left, 
                                (end.top + end.bottom) / 2 - parent_box.top, 
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top); 
    }
    /*
    if((end.top + end.bottom) / 2 < start.top + 2) { //middle of rect is above top of span
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.top - parent_box.top);
        new_path.quadraticCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                start.top - parent_box.top - 6,
                                text_box.left - parent_box.left,
                                start.top - parent_box.top - 6);

        new_path.bezierCurveTo(svg_box.right - parent_box.left, 
                                start.top - parent_box.top - 6, 
                                svg_box.right - parent_box.left, 
                                (end.top + end.bottom) / 2 - parent_box.top, 
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top); 
    }
    else if((end.top + end.bottom) / 2 < start.bottom) { // middle of rect is within height of span
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.top - parent_box.top);
        new_path.quadraticCurveTo(text_box.left, 
                                text_box.top,
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top);
    }
    else if (end.top - start.top > 5) { // rect is significantly lower than span
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.bottom - parent_box.top);
        new_path.quadraticCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                start.bottom - parent_box.top + 6,
                                text_box.left - parent_box.left,
                                start.bottom - parent_box.top + 6);

        new_path.bezierCurveTo(svg_box.right - parent_box.left, 
                                start.bottom - parent_box.top + 6, 
                                svg_box.right - parent_box.left, 
                                (end.top + end.bottom) / 2 - parent_box.top, 
                                end.right - parent_box.left,
                                (end.top + end.bottom) / 2 - parent_box.top); 
    }
    else{
        new_path.moveTo((start.left + start.right) / 2 - parent_box.left, start.bottom - parent_box.top);
        new_path.quadraticCurveTo((start.left + start.right) / 2 - parent_box.left, 
                                    (end.top + end.bottom) / 2 - parent_box.top,
                                    end.right - parent_box.left,
                                    (end.top + end.bottom) / 2 - parent_box.top);
    }
    */

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
        /*.style("stroke", "var(--light-acc)")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5")
        .style("fill", "none")*/
        .attr("d", path)
        .attr("onmouseover", "highlight_link(event)")
        .attr("onmouseout", "unhighlight_link(event)"); 
}

function highlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.add("selected_link");
    console.log("it is done.")
}

function unhighlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.remove("selected_link");
    console.log("it is done.")
}