class SVGPane {
    constructor(svg) {
        this.svg = svg;
        this.viewBox = {"min_x": 0, "min_y": 0, "width": this.svg.clientWidth, "height": this.svg.clientHeight};

        this.svg.onwheel = zoom;
        this.svg.onmousedown = startPan;

    }

    reset() {
        clearElementChildren(this.svg);
        this.resetViewBox();
    }

    resetViewBox() {
        this.viewBox = {"min_x": 0, "min_y": 0, "width": this.svg.clientWidth, "height": this.svg.clientHeight};
        this.setViewBox();
    }

    getSVG() {
        return this.svg;
    }

    setViewBox() {
        this.svg.setAttribute("viewBox", `${this.viewBox.min_x} ${this.viewBox.min_y} ${this.viewBox.width} ${this.viewBox.height}`)
    }

    startPan(x, y) {
        this.svg.onmousemove = pan;
        this.svg.onmouseup = endPan;
        this.panPos = {"x": x, "y": y};
    }

    pan(x, y) {

        // Get amount mouse has moved
        let offset = {"x": this.panPos.x - x, "y": this.panPos.y - y}
        // Update the object member
        this.viewBox.min_x += offset.x;
        this.viewBox.min_y += offset.y;

        // update the element
        this.setViewBox();
        
        // Reset pan
        this.panPos =  {"x": x, "y": y};
    }

    endPan(path) {
        this.svg.onmousemove = null;
        this.svg.onmouseup = null;
    }

    zoom(dY) {

        let oldWidth = this.viewBox.width;
        let oldHeight = this.viewBox.height;
        if(this.viewBox.height + dY * ZOOM_AMT > 0)
            this.viewBox.height += dY * ZOOM_AMT;
        
        if(this.viewBox.width + dY * ZOOM_AMT > 0)    
            this.viewBox.width += dY * ZOOM_AMT;
        
        this.viewBox.min_x += (oldWidth - this.viewBox.width)/2
        this.viewBox.min_y += (oldHeight - this.viewBox.height)/2
        this.setViewBox()
    }
};