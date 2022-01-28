const MARK_SIZE = 8;

/**
 * A region of an image selected as containing an object or group of objects 
 */
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

    /**
     * Set method for the name of this rectangle
     * @param {string} name the string to set this rectangle's name to
     */
    rename(name) {
        this.name = name;
    }
    
    /**
     * Display to the user the region of the image that this rectangle 
     *     represents
     */
    check() {
        //if the width of the selection is greater
        if((this.bounds[2] - this.bounds[0]) 
            > (this.bounds[3] - this.bounds[1])) {
            pre_canvas.width = 1000;

            //set the height of the canvas to the appropriate size
            pre_canvas.height = pre_canvas.width * 
            ((this.bounds[3] - this.bounds[1]) / 
            (this.bounds[2] - this.bounds[0]));

        } else {
            pre_canvas.height = 1000;
        }

        //draw the image
        pre_ctx.drawImage(base_img, this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0],
            this.bounds[3] - this.bounds[1], 0, 0,
            pre_canvas.width,
            pre_canvas.height);
    }

    /**
     * Update the region that this rectangle represents
     * @param {number} left The left boundary of the region
     * @param {number} up the top boundary of the region
     * @param {number} right the right boundary
     * @param {number} low the bottom boundary
     */
    update(left, up, right, low) {
        this.bounds = [left * this.adj, up * this.adj, right * this.adj, low * this.adj];
        this.unadjusted = [left, up, right, low];
        this.check();
    }

    /**
     * Update this rectangle's boundaries based on a SVG rectangle
     * @param {HTMLElement} rect The html element that should represent this
     *     Rectangle
     */
    rectUpdate(rect) {
        let box = getRelCoords(rect.svg, svg_cont);
        this.bounds = [box.left * this.adj, box.top * this.adj, box.right * this.adj, box.bottom * this.adj];
        this.unadjusted = [box.left, box.top, box.right, box.bottom];
        if(this.name == this.id)
            this.name = rect.id;
        this.id = rect.id;
    }

    /**
     * Update the aspect ratio of this rectangle
     */
    adjUpdate() {
        this.adj = base_img.naturalWidth / base_img.width;
        for(let i = 0; i < this.bounds.length; i++)
            this.bounds[i] = this.unadjusted[i] * this.adj;
    }

    /**
     * Place the corners used for editing the rectangle
     */
    set_corners() {
        let box = getRelCoords(this.svg, svg_cont);

        if(!this.tl_crn) {
            this.tl_crn = document.createElementNS(svgns, 'rect');
            this.tl_crn.setAttribute("x",  box.left - MARK_SIZE/2);
            this.tl_crn.setAttribute("y", box.top - MARK_SIZE/2);
            this.tl_crn.setAttribute('id', this.id + '_tl');
            this.tl_crn.classList.add("corner");
            this.tl_crn.setAttribute('onmousedown', "begin_edit(event, 'tl')");
            this.make_marker(this.tl_crn);
        }

        if(!this.tr_crn) {
            this.tr_crn = document.createElementNS(svgns, 'rect');
            this.tr_crn.setAttribute("x", box.right - MARK_SIZE/2);
            this.tr_crn.setAttribute("y",  box.top - MARK_SIZE/2);
            this.tr_crn.setAttribute('id', this.id + '_tr');
            this.tr_crn.classList.add("corner");
            this.tr_crn.setAttribute('onmousedown', "begin_edit(event, 'tr')");
            this.make_marker(this.tr_crn);
        }

        if(!this.br_crn) {
            this.bl_crn = document.createElementNS(svgns, 'rect');
            this.bl_crn.setAttribute("x", (box.left) - MARK_SIZE/2);
            this.bl_crn.setAttribute("y", (box.bottom) - MARK_SIZE/2);
            this.bl_crn.setAttribute('id', this.id + '_bl');
            this.bl_crn.classList.add("corner");
            this.bl_crn.setAttribute('onmousedown', "begin_edit(event, 'bl')");
            this.make_marker(this.bl_crn);
        }

        if(!this.br_crn) {
            this.br_crn = document.createElementNS(svgns, 'rect');
            this.br_crn.setAttribute("x", (box.right) - MARK_SIZE/2);
            this.br_crn.setAttribute("y", (box.bottom) - MARK_SIZE/2);
            this.br_crn.setAttribute('id', this.id + '_br');
            this.br_crn.classList.add("corner");
            this.br_crn.setAttribute('onmousedown', "begin_edit(event, 'br')");
            this.make_marker(this.br_crn);
        }

        if(!this.mid) {
            this.mid = document.createElementNS(svgns, 'rect');
            this.mid.setAttribute("x", (box.left + box.right) / 2 - MARK_SIZE/2);
            this.mid.setAttribute("y", (box.top + box.bottom) / 2 - MARK_SIZE/2);
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

    /**
     * Set the common attributes for all of the markers of this rectangle
     * @param {HTMLElement} marker The marker element being set up 
     */
    make_marker(marker) {
        marker.setAttribute('width', MARK_SIZE);
        marker.setAttribute('height', MARK_SIZE);
        marker.setAttribute('fill', 'var(--highlight)');
        marker.setAttribute('fill-opacity', 1);
        marker.setAttribute('display', 'block');
        marker.setAttribute('position', 'absolute');
        this.group.appendChild(marker);
    }

    /**
     * The mouse has left the rectangle, so remove all the editing controls
     */
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

    /**
     * highlight this rectangle for the user
     */
    select() {
        this.svg.classList.add('selected');
        this.check();
    }

    /**
     * Delete the rectangle this object represents
     */
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

    /**
     * Change the index of this rectangle and the ID's of the svg elements
     * @param {number} ind the new index for this rectangle 
     */
    update_index(ind) {
        if(this.isSelected) {
            this.deselect();
        }
        this.group.setAttribute('id', "group_" + ind);
        this.svg.setAttribute('id', "rect_" + ind);
    }

    /**
     * Change the size of this rectangle
     * @param {float} wAdj Factor to change width by 
     * @param {float} hAdj Factor to change height by
     */
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

    /**
     * Change the color of this rectangles svg element
     * @param {Color} col the color to set this rectangle to 
     */
    set_color(col) {
        this.svg.setAttribute("fill", col);
        this.svg.setAttribute("stroke", col);
    }
} 



