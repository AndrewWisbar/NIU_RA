const marker_size = 8;

class rectangle {

    constructor(left, up, right, low, rect, group, name) {
        this.adj = base_img.naturalWidth / base_img.width;
        this.bounds = [left * this.adj, up * this.adj, right * this.adj, low * this.adj];
        this.unadjusted = [left, up, right, low];
        this.id = rect.id;
        this.svg = rect;
        this.group = group;
        this.isSelected = false;
        this.name;
        this.tl_crn = null;
        this.tr_crn = null;
        this.bl_crn = null;
        this.br_crn = null;
        this.mid = null;
        this.label = null;
        this.group.setAttribute('ondrop', "drop_handler(event)");
        this.group.setAttribute('ondragover', "dragover_handler(event)");
        this.group.setAttribute("onmouseover", "select_rect(this)");
        this.group.setAttribute('onmouseleave', "deselect(event)");

        if(name)
            this.name = name;
        else
            this.name = this.id;
    }

    rename(name) {
        this.name = name;
    }
    // called after a user selects a portion of the image
    check() {
        //if the width of the selection is greater
        if((this.bounds[2] - this.bounds[0]) > (this.bounds[3] - this.bounds[1])) {
            pre_canvas.width = 1000;

            //set the height of the canvas to the appropriate size
            pre_canvas.height = pre_canvas.width * ((this.bounds[3] - this.bounds[1]) / (this.bounds[2] - this.bounds[0]));
        } else {
            pre_canvas.height = 1000;

            //get the ratio of height/width

            //set the width of the canvas based on the ratio
        }

        //draw the image
        pre_ctx.drawImage(base_img, this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0],
            this.bounds[3] - this.bounds[1], 0, 0,
            pre_canvas.width,
            pre_canvas.height);
    }

    update(left, up, right, low) {
        this.bounds = [left * this.adj, up * this.adj, right * this.adj, low * this.adj];
        this.unadjusted = [left, up, right, low];
        this.check();
    }

    rectUpdate(rect) {
        let box = getRelCoords(rect.svg, svg_cont);
        this.bounds = [box.left * this.adj, box.top * this.adj, box.right * this.adj, box.bottom * this.adj];
        this.unadjusted = [box.left, box.top, box.right, box.bottom];
        if(this.name == this.id)
            this.name = rect.id;
        this.id = rect.id;
    }

    adjUpdate() {
        this.adj = base_img.naturalWidth / base_img.width;
        for(let i = 0; i < this.bounds.length; i++)
            this.bounds[i] = this.unadjusted[i] * this.adj;
    }

    set_corners() {
        let box = getRelCoords(this.svg, svg_cont);

        if(!this.tl_crn) {
            this.tl_crn = document.createElementNS(svgns, 'rect');
            this.tl_crn.setAttribute("x",  box.left - marker_size/2);
            this.tl_crn.setAttribute("y", box.top - marker_size/2);
            this.tl_crn.setAttribute('id', this.id + '_tl');
            this.tl_crn.classList.add("corner");
            this.tl_crn.setAttribute('onmousedown', "begin_edit(event, 'tl')");
            this.make_marker(this.tl_crn);
        }

        if(!this.tr_crn) {
            this.tr_crn = document.createElementNS(svgns, 'rect');
            this.tr_crn.setAttribute("x", box.right - marker_size/2);
            this.tr_crn.setAttribute("y",  box.top - marker_size/2);
            this.tr_crn.setAttribute('id', this.id + '_tr');
            this.tr_crn.classList.add("corner");
            this.tr_crn.setAttribute('onmousedown', "begin_edit(event, 'tr')");
            this.make_marker(this.tr_crn);
        }

        if(!this.br_crn) {
            this.bl_crn = document.createElementNS(svgns, 'rect');
            this.bl_crn.setAttribute("x", (box.left) - marker_size/2);
            this.bl_crn.setAttribute("y", (box.bottom) - marker_size/2);
            this.bl_crn.setAttribute('id', this.id + '_bl');
            this.bl_crn.classList.add("corner");
            this.bl_crn.setAttribute('onmousedown', "begin_edit(event, 'bl')");
            this.make_marker(this.bl_crn);
        }

        if(!this.br_crn) {
            this.br_crn = document.createElementNS(svgns, 'rect');
            this.br_crn.setAttribute("x", (box.right) - marker_size/2);
            this.br_crn.setAttribute("y", (box.bottom) - marker_size/2);
            this.br_crn.setAttribute('id', this.id + '_br');
            this.br_crn.classList.add("corner");
            this.br_crn.setAttribute('onmousedown', "begin_edit(event, 'br')");
            this.make_marker(this.br_crn);
        }

        if(!this.mid) {
            this.mid = document.createElementNS(svgns, 'rect');
            this.mid.setAttribute("x", (box.left + box.right) / 2 - marker_size/2);
            this.mid.setAttribute("y", (box.top + box.bottom) / 2 - marker_size/2);
            this.mid.setAttribute('onmousedown', "begin_move(event)");
            this.mid.setAttribute('id', this.id + '_mid');
            this.mid.classList.add("center");
            this.make_marker(this.mid);
        }

        if(!this.label) {
            this.label = document.createElementNS(svgns, "text");
            this.label.setAttribute("class", "svg_text");
            this.label.setAttribute('x', (box.left) - 5);
            this.label.setAttribute('y', (box.top) - 10);
            this.label.innerHTML = this.name;
            this.label.setAttribute('id', this.id + "_label");
            this.group.appendChild(this.label);
        }
    }

    make_marker(marker) {
        marker.setAttribute('width', marker_size);
        marker.setAttribute('height', marker_size);
        marker.setAttribute('fill', 'var(--highlight)');
        marker.setAttribute('fill-opacity', 1);
        marker.setAttribute('display', 'block');
        marker.setAttribute('position', 'absolute');
        this.group.appendChild(marker);
    }

    deselect() {
        if(this.isSelected) {
            let temp = this.tl_crn;
            this.tl_crn = null;
            this.group.removeChild(temp);
            
            temp = this.tr_crn;
            this.tr_crn = null;
            this.group.removeChild(temp);

            temp = this.bl_crn;
            this.bl_crn = null;
            this.group.removeChild(temp);

            temp = this.br_crn;
            this.br_crn = null;
            this.group.removeChild(temp);

            temp = this.mid;
            this.mid = null;
            this.group.removeChild(temp);

            temp = this.label;
            this.label = null;
            this.group.removeChild(temp);

            this.isSelected = false;
            this.svg.classList.remove('selected');
        }
    }

    select() {
        this.svg.classList.add('selected');
        this.check();
    }

    delete() {
        console.log(this);
        let rect = this.svg;
        this.svg = null;
        rect.remove();

        let group = this.group;
        this.group = null;
        group.remove();
        console.log(this)


    }

    update_index(ind) {
        if(this.isSelected) {
            this.deselect();
        }
        this.group.setAttribute('id', "group_" + ind);
        this.svg.setAttribute('id', "rect_" + ind);
    }


    resize(wAdj, hAdj) {
        let oldX = parseFloat(this.svg.getAttribute("x"));
        let oldY = parseFloat(this.svg.getAttribute("y"));

        let oldW = parseFloat(this.svg.getAttribute("width"));
        let oldH = parseFloat(this.svg.getAttribute("height"));

        this.svg.setAttribute("x", oldX / wAdj);
        this.svg.setAttribute("y", oldY / hAdj);
        this.svg.setAttribute("width", oldW / wAdj);
        this.svg.setAttribute("height", oldH / hAdj);
        this.adjUpdate();
        this.rectUpdate(this);

        if(this.isSelected) {
            this.select();
            this.set_corners();
        }

        
    }
} 



