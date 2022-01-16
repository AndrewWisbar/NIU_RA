
let links = [];
let tracing = -1;
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

    links.push(new word_link(rect_control.rects[index], word, ev.target, span));
    select_rect(ev.target);
    write_links();
}


function write_links() {

    link_list.innerHTML = '';
    line_cont.html("");
    let temp = new Array(rect_control.rects.length);
    for(var i = 0; i < temp.length; i++) {
        temp[i] = new Array(0);
    }

    for(var i = 0; i < links.length; i++) {
        draw_links(i, links.length);

        var tmp_i = parseInt(links[i].rect.id.match(/\d+/),10);
        temp[tmp_i].push(links[i].word);
    }

    for(var i = 0; i < temp.length; i++) {
        if(temp[i].length > 1) {
            let item = document.createElement("li");
            item.innerHTML = rect_control.rects[i].name + ' is linked to the words "';
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
            item.innerHTML = rect_control.rects[i].name + ' is linked to the word "' + temp[i][0] + '"';
            link_list.appendChild(item);
        }
    }    
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

function draw_links(index, num) {
    links[index].update();

    let path = links[index].get_path();
    let hue  = (360 / num + 1) * index; 
    line_cont.append('path')
        .attr("d", path)
        .attr("onmouseover", "highlight_link(event)")
        .attr("onmouseout", "unhighlight_link(event)")
        .attr('onmousedown', "start_trace(event)")
        .attr("id", "link_" + index)
        .attr("stroke", "hsla(" + hue + ",80%,75%,.75)");
}

function highlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.add("selected_link");
}

function unhighlight_link(e) {
    let sel_link = e.target;
    sel_link.classList.remove("selected_link");
}

function start_trace(e) {
    
    var index = parseInt(e.target.id.match(/\d+/),10);
    let l = links[index];
    let len = l.end.y - l.start.y;
    let t = (e.clientY - l.start.y) / len;
    tracing = index;

    document.addEventListener('mousemove', trace)
    document.addEventListener("mouseup", end_trace)

}

function end_trace() {
    links.forEach(link => link.remove_tracker());
    //document.removeEventListener("mouseup", end_trace);
    document.removeEventListener('mousemove', trace);
}

function trace(event) {
    console.log("OK")
    let l = []; // array to hold the links we're interested in
    let len = links[tracing].end.y - links[tracing].start.y;
    let t = (event.clientY - links[tracing].start.y) / len;

    if(event.shiftKey) {
        //clear the current trackers 
        links.forEach(link => link.remove_tracker())

        //if the user is holding shift we want to trace multiple links
        l.push(links[tracing]);
        if(event.movementY >= 0) {
            // get other links connected to this word
            links.forEach(link => {
                if(link.span == links[tracing].span) {
                    l.push(link);
                }
            }) 
        }
        else {
            // get other links connected to this rect
            links.forEach(link => {
                if(link.rect == links[tracing].rect) {
                    l.push(link);
                }
            }) 
        }

        l.forEach(link => link.place_tracker(t));
    }
    else {
        l = links[tracing];
        l.place_tracker(t);
        links.forEach(link => {
            if(link != l) {
                link.remove_tracker();
            }
        })
    }
}