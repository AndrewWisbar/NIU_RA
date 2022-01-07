class word_link {
    constructor(region, word, rect, span) {
        this.region = region;
        this.word = word;
        this.rect = rect;
        this.span = span;
        this.id = this.rect.id;
        this.start;
        this.cp1;
        this.cp2;
        this.end;

        this.update();
    }


    // Calculate control points
    update() {
        let start = this.span.getBoundingClientRect();
        let end = this.rect.getBoundingClientRect();

        this.start = {x: (start.left + start.right) / 2,
                      y: start.bottom};
        this.cp1 = {x: (start.left + start.right) / 2,
                    y: (start.bottom + end.top) / 2};
        this.cp2 = {x: (end.right + end.left) / 2,
                    y: (start.bottom + end.top) / 2};
        this.end = {x: (end.right + end.left) / 2,
                    y: end.top};
    }
    
    // Get path for svg objects
    get_path() {
        let parent_box = getCoords(document.getElementById("line_cont"));
        var new_path = d3.path();
    
    
        new_path.moveTo(this.start.x - parent_box.left, this.start.y - parent_box.top);
        new_path.bezierCurveTo( this.cp1.x - parent_box.left, 
                                this.cp1.y - parent_box.top,
                                this.cp2.x - parent_box.left,
                                this.cp2.y - parent_box.top,
                                this.end.x - parent_box.left,
                                this.end.y - parent_box.top);
    
        return new_path;
    }

    // get methods

    get_start() {
        return this.start;
    }

    get_cp1() {
        return this.cp1;
    }

    get_cp2() {
        return this.cp2;
    }

    get_end() {
        return this.end;
    }

    // t must be normalized to the length of the path
    // These functions are broken into 2 because usually you do not need to get both the x and y
    // this could be optimized
    get_point_x(t) {
        if(t > 1) { t = 1 }
        if(t < 0) { t = 0 }
        let parent_box = getCoords(document.getElementById("line_cont"));
        let e0 = Math.pow((1-t), 3) * this.start.x;
        let e1 = 3 * Math.pow((1-t), 2) * t * this.cp1.x;
        let e2 = 3 * (1 - t) * Math.pow(t, 2) * this.cp2.x;
        let e3 = Math.pow(t, 3) * this.end.x;
        return e0 + e1 + e2 + e3 - parent_box.left;
    }

    get_point_y(t) {
        if(t > 1) { t = 1 }
        if(t < 0) { t = 0 }
        let parent_box = getCoords(document.getElementById("line_cont"));
        let e0 = Math.pow((1-t), 3) * this.start.y;
        let e1 = 3 * Math.pow((1-t), 2) * t * this.cp1.y;
        let e2 = 3 * (1 - t) * Math.pow(t, 2) * this.cp2.y;
        let e3 = Math.pow(t, 3) * this.end.y;
        return e0 + e1 + e2 + e3 - parent_box.top; 
    }
}