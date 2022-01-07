class rectangle_controller {
    constructor(svg_cont, svgns, image, preview_canv) {
        this.svg = svg_cont;
        this.img = image;
        this.preview = preview_canv;
        this.svgns = svgns
        this.rects = [];

        this.corners = [];
        for(var i = 0; i < 4; i++) {
            this.corners.push(document.getElementById("corner_" + i));
        }

        this.corners.push(document.getElementById("center"));

        //Flags to control mouse interaction
        this.draw_flag = false;
        this.prev_point = false;
        this.valid_selection = false;
        this.rectangle_created = false;

        //Points used to draw selection rectangle
        this.anchor_point = {x: 0, y: 0};
        this.top_left_point = {x: 0, y: 0};
        this.bottom_right_point = {x: 0, y: 0};

        this.active_rect;
        this.edit_flag = false;
        this.valid_edit = false;

        this.move_anchor = {x: 0, y: 0};
        this.move_start = {x: 0, y: 0};
        this.move_offset = {x: 0, y: 0};

        this.edit_anchor = {x: 0, y: 0};
        this.edit_tlp = {x: 0, y: 0};
        this.edit_brp = {x: 0, y: 0};

        this.move_rect;
        this.move_index;

        this.edit_rect;
        this.edit_index;

        this.label_text = document.getElementById("label_text");
        this.cor_anchor = document.getElementById("corner_anchor");
        this.label;
    }

    updateSVG(svg) {
        this.svg = svg;
    }

    update_children() {
        for(let i = 0; i < this.rects.length; i++) {
            this.rects[i].update_index(i);
        }
    }


    resizeSVG() {
        let oldWidth = this.svg.clientWidth;
        let oldHeight = this.svg.clientHeight;
        this.svg.setAttribute("height",this.img.clientHeight);
        this.svg.setAttribute("width", this.img.clientWidth);
        let widthAdj = oldWidth / this.img.clientWidth;
        let heightAdj = oldHeight / this.img.clientHeight;
    
        let children = this.svg.children;
        for(let i = 0; i < children.length; i++) {
            let oldX = parseFloat(children[i].getAttribute("x"));
            let oldY = parseFloat(children[i].getAttribute("y"));
    
            let oldW = parseFloat(children[i].getAttribute("width"));
            let oldH = parseFloat(children[i].getAttribute("height"));
    
            children[i].setAttribute("x", oldX / widthAdj);
            children[i].setAttribute("y", oldY / heightAdj);
            children[i].setAttribute("width", oldW / widthAdj);
            children[i].setAttribute("height", oldH / heightAdj);
            this.rects[i].adjUpdate();
            this.rects[i].rectUpdate(children[i]);
    
            if(children[i].classList.contains("selected"))
                this.select_rect(children[i]);
    
            
        }
        write_links();
    }


    select_rect(selected) {
        if(!(this.edit_flag || this.draw_flag || this.move_flag)) {
            let index = parseInt(selected.id.match(/\d+/),10);
            
            for(var i = 0; i < this.rects.length; i++) {
                this.rects[i].deselect();
            }
    
            this.rects[index].select();
            this.label = this.rects[index].name;
            this.rects[index].set_corners(this.label_text);
            this.rects[index].isSelected = true;
            this.rects[index].check();
        }
    }

    createRect(ind, rect) {
        let rect_id = "rect_" + ind;
        rect.setAttribute("fill", colorPicker.value);
        rect.setAttribute("stroke-width", sizePicker.value);
        rect.setAttribute("stroke", colorPicker.value);
        rect.setAttribute("fill-opacity", 0);
        rect.setAttribute("id", rect_id);
        rect.setAttribute('ondrop', "drop_handler(event)");
        rect.setAttribute('ondragover', "dragover_handler(event)");
        rect.addEventListener('dragenter', function(e) {
            e.preventDefault();
            e.target.classList.add('dragging');
        });

        rect.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.target.classList.remove('dragging');
        });
        this.rectangle_created = true;
    }

    gotDetection(results) {    
        for(let i = 0; i < results.length; i++) {
            let obj = results[i];
            let new_rect = document.createElementNS(svgns, "rect");
            let new_group = document.createElementNS(svgns, 'svg');
            new_group.setAttribute('id', "group_" + this.rects.length)
            new_rect.setAttribute('id', 'rect_' + this.rects.length);
    
            this.svg.appendChild(new_group);
            new_group.appendChild(new_rect);
            new_rect.setAttribute("fill", "#00FFFF");
            new_rect.setAttribute("stroke-width", 2);
            new_rect.setAttribute("stroke", "#00FFFF");
            new_rect.setAttribute("fill-opacity", 0);
            new_rect.addEventListener('dragenter', function(e) {
                e.preventDefault();
                e.target.classList.add('dragging');
            });
        
            new_rect.addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.target.classList.remove('dragging');
            });
    
            
            new_rect.setAttribute("x", obj.bbox[0]);
            new_rect.setAttribute("y", obj.bbox[1]);
            new_rect.setAttribute("width", obj.bbox[2]);
            new_rect.setAttribute("height", obj.bbox[3]);
    
            new_rect.classList.add("finished_rect");

    
            this.rects.push(new rectangle(0, 0, 0, 0, new_rect, new_group, obj.class,));
        }
    }

    delete_rect(index) {
        this.rects[index].delete();
        this.rects.splice(index, 1);
    }

    begin_edit(e, corner) {
        this.edit_index = parseInt(e.target.id.match(/\d+/),10);
        this.edit_rect = this.rects[this.edit_index];
    
    
        let box = getRelCoords(this.edit_rect.svg, this.svg);
        
        if(corner == "tl") {
            this.edit_anchor = [box.right, box.bottom];
            
        }
        else if(corner == "tr") {
            this.edit_anchor = [box.left, box.bottom];
            
        }
        else if(corner == "bl") {
            this.edit_anchor = [box.right, box.top];
        }
        else {
            this.edit_anchor = [box.left, box.top];
        }
        this.edit_tlp = {x: box.left, y: box.top};
        this.edit_brp = {x: box.right, y: box.bottom};

        this.svg.setAttribute("onmousemove", "rect_control.edit(event, '" + corner + "')");
        this.svg.setAttribute("onmouseup", "rect_control.end_edit(event)");
    }   

    edit(e, corner) {
        let old_rect = this.rects[this.edit_index].svg;

    }
    
    end_edit() {
        console.log(this.edit_anchor);
        this.svg.removeAttribute("onmousemove");
        this.svg.removeAttribute("onmouseup");
    }
    
    begin_move(e) {
        this.move_index = parseInt(e.target.id.match(/\d+/),10);
        let rect = this.rects[this.move_index].svg;
        this.move_start = {x: parseFloat(rect.getAttribute('x')),
                           y: parseFloat(rect.getAttribute('y'))}
        this.move_anchor = {x: e.clientX, y: e.clientY};
        this.svg.setAttribute("onmousemove", "rect_control.move(event)");
        this.svg.setAttribute("onmouseup", "rect_control.end_move(event)");
        this.rects[this.move_index].group.removeAttribute('onmouseover');
        this.svg.removeAttribute('onmousedown');
        this.rects[this.move_index].deselect();
    }
    
    move(e) {
        let rect = this.rects[this.move_index];
        let diffx = e.clientX - this.move_anchor.x;
        let diffy = e.clientY - this.move_anchor.y;

        rect.svg.setAttribute('x', this.move_start.x + diffx);
        rect.svg.setAttribute('y', this.move_start.y + diffy);

        rect.rectUpdate(rect);
        write_links();
        rect.check();
    }

    end_move() {
        this.svg.removeAttribute("onmousemove");
        this.svg.removeAttribute("onmouseup");
        this.rects[this.move_index].group.setAttribute("onmouseover", "select_rect(this)");
        this.svg.setAttribute('onmousedown', 'rect_control.begin_draw()');
        this.move_index = null;
    }

    deselect() {
        for(let i = 0; i < this.rects.length; i++) {
            if(this.rects[i].isSelected) {
                this.rects[i].deselect();
            }
        }
    }
}