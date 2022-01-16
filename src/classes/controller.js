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

        //Points used to draw selection rectangle
        this.anchor_point = {x: 0, y: 0};
        this.top_left_point = {x: 0, y: 0};
        this.bottom_right_point = {x: 0, y: 0};

        this.active_rect;

        this.move_anchor = {x: 0, y: 0};
        this.move_start = {x: 0, y: 0};
        this.move_offset = {x: 0, y: 0};

        this.edit_anchor = {x: 0, y: 0};
        this.edit_tlp = {x: 0, y: 0};
        this.edit_brp = {x: 0, y: 0};

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
    
        this.rects.forEach(rect => rect.resize(widthAdj, heightAdj));
        write_links();
    }


    select_rect(selected) {
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
            new_rect.setAttribute("fill", colorPicker.value);
            new_rect.setAttribute("stroke-width", 2);
            new_rect.setAttribute("stroke", colorPicker.value);
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
    
            new_rect.classList.add("selection");

    
            this.rects.push(new rectangle(0, 0, 0, 0, new_rect, new_group, obj.class,));
        }
    }

    delete_rect(index) {
        this.rects[index].delete();
        this.rects.splice(index, 1);
    }

    begin_draw(e) {
        this.anchor_point = this.getBoundedPos(e);
        this.top_left_point = {x: this.anchor_point.x, y: this.anchor_point.y};
        this.active_rect = document.createElementNS(svgns, "rect");
        this.createRect(this.svg.childElementCount, this.active_rect);
        this.svg.appendChild(this.active_rect);
        this.svg.setAttribute("onmousemove", "rect_control.draw(event)");
        this.svg.setAttribute("onmouseup", "rect_control.end_draw(event)");
    }

    draw(e) {
        let pos = this.getBoundedPos(e);
       
        this.find_points(pos, this.anchor_point, this.top_left_point, this.bottom_right_point);
        
        this.active_rect.setAttribute('x', this.top_left_point.x);
        this.active_rect.setAttribute('y', this.top_left_point.y);
        this.active_rect.setAttribute('width', this.bottom_right_point.x - this.top_left_point.x);
        this.active_rect.setAttribute('height', this.bottom_right_point.y - this.top_left_point.y);
    }

    end_draw(e) {
        let new_group = document.createElementNS(svgns, 'svg');
        this.svg.appendChild(new_group)
        new_group.setAttribute('id', "group_" + this.rects.length)
        new_group.appendChild(this.active_rect);
        this.rects.push(new rectangle(0, 0, 0, 0, this.active_rect, new_group))
        this.svg.removeAttribute("onmousemove");
        this.svg.removeAttribute("onmouseup");
        this.active_rect = null;
    }

    begin_edit(e, corner) {
        this.edit_index = parseInt(e.target.id.match(/\d+/),10);
        this.edit_rect = this.rects[this.edit_index];
    
    
        let box = getRelCoords(this.edit_rect.svg, this.svg);
        
        if(corner == "tl") {
            this.edit_anchor = {"x": box.right, "y": box.bottom};
            
        }
        else if(corner == "tr") {
            this.edit_anchor = {"x": box.left, "y": box.bottom};
            
        }
        else if(corner == "bl") {
            this.edit_anchor = {"x": box.right, "y": box.top};
        }
        else {
            this.edit_anchor = {"x": box.left, "y": box.top};
        }
        this.edit_tlp = {x: box.left, y: box.top};
        this.edit_brp = {x: box.right, y: box.bottom};

        this.svg.setAttribute("onmousemove", "rect_control.edit(event)");
        this.svg.setAttribute("onmouseup", "rect_control.end_edit(event)");

        this.edit_rect.group.removeAttribute('onmouseover');
        this.edit_rect.deselect();
    }   

    edit(e) {
        let pos = this.getBoundedPos(e);

        this.find_points(pos, this.edit_anchor, this.edit_tlp, this.edit_brp);
        
        this.edit_rect.svg.setAttribute("x", this.edit_tlp.x);
        this.edit_rect.svg.setAttribute("width", this.edit_brp.x - this.edit_tlp.x);
        this.edit_rect.svg.setAttribute("y", this.edit_tlp.y);
        this.edit_rect.svg.setAttribute("height", this.edit_brp.y - this.edit_tlp.y);
        this.edit_rect.rectUpdate(this.edit_rect);
        this.edit_rect.check();
    }
    
    end_edit() {
        this.edit_rect.group.setAttribute("onmouseover", "select_rect(this)");
        this.svg.removeAttribute("onmousemove");
        this.svg.removeAttribute("onmouseup");
        this.edit_rect = null;
        this.edit_index = null;
    }
    
    begin_move(e) {
        this.move_index = parseInt(e.target.id.match(/\d+/),10);
        let rect = this.rects[this.move_index].svg;
        this.move_start = {x: parseFloat(rect.getAttribute('x')),
                           y: parseFloat(rect.getAttribute('y'))}
        this.move_anchor = getMousePos(this.svg, e);
        this.svg.setAttribute("onmousemove", "rect_control.move(event)");
        this.svg.setAttribute("onmouseup", "rect_control.end_move(event)");
        this.rects[this.move_index].group.removeAttribute('onmouseover');

        this.rects[this.move_index].deselect();
    }
    
    move(e) {

        let rect = this.rects[this.move_index];
        let pos = getMousePos(this.svg, e)
        let rect_h = rect.svg.getAttribute("height")/2;
        let rect_w = rect.svg.getAttribute("width")/2;+.0

        // make sure the bounds of the rect dont leave the svg area
        if(pos.x > this.svg.getAttribute('width') - rect_w)
            pos.x = this.svg.getAttribute('width') - rect_w;
        else if(pos.x < rect_w) 
            pos.x = rect_w;

        if(pos.y > this.svg.getAttribute('height') - rect_h)
            pos.y = this.svg.getAttribute('height') - rect_h;
        else if(pos.y < rect_h) 
            pos.y = rect_h;

        let diffx = 0, diffy = 0;

        // if the shift key is pressed make the change in only the largest dimension
        if(e.shiftKey) {
            if(Math.abs(pos.x - this.move_anchor.x) >= Math.abs(pos.y - this.move_anchor.y))
                diffx = pos.x - this.move_anchor.x;
            else
                diffy = pos.y - this.move_anchor.y;
        }
        else {
            diffx = pos.x - this.move_anchor.x;
            diffy = pos.y - this.move_anchor.y;
        }

        // update the svg properties
        rect.svg.setAttribute('x', this.move_start.x + diffx);
        rect.svg.setAttribute('y', this.move_start.y + diffy);

        // update the rect object
        rect.rectUpdate(rect);

        write_links();
        rect.check();
    }

    end_move() {
        this.svg.removeAttribute("onmousemove");
        this.svg.removeAttribute("onmouseup");
        this.rects[this.move_index].group.setAttribute("onmouseover", "select_rect(this)");
        this.move_index = null;
    }

    find_points(pos, anchor, tlp, brp) {
        if(pos.x < anchor.x) {
            brp.x = anchor.x;
            tlp.x = pos.x;
        }
        else
            brp.x = pos.x;

        if(pos.y < anchor.y) {
            brp.y = anchor.y;
            tlp.y = pos.y;
        }
        else
            brp.y = pos.y;
    }

    deselect() {
        for(let i = 0; i < this.rects.length; i++) {
            if(this.rects[i].isSelected) {
                this.rects[i].deselect();
            }
        }
    }

    getBoundedPos(e) {
        let pos = getMousePos(this.svg, e);
        if(pos.x < 0)
            pos.x = 0;
        if(pos.x > this.svg.clientWidth)
            pos.x = this.svg.clientWidth;
        if(pos.y < 0)
            pos.y = 0;
        if(pos.y > this.svg.clientHeight)
            pos.y = this.svg.clientHeight;
        
        return pos;
    }
}