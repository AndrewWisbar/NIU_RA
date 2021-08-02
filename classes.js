/******************************************************************************
 ******************************Class Definitions*******************************
 *****************************************************************************/

 class selected_region {

    constructor(left, up, right, low, id, name) {
        this.adj = base_img.naturalWidth / base_img.width
        this.bounds = [left * this.adj, up * this.adj, right * this.adj, low * this.adj];
        this.unadjusted = [left, up, right, low];
        this.id = id;

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
        var ratio;

        //if the width of the selection is greator
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

        //log the bounds of the selection
        /*
        console.log("(", Math.floor(this.bounds[0]), ", ",
            Math.floor(this.bounds[1]), ")  (", 
            Math.floor(this.bounds[2]), ", ", 
            Math.floor(this.bounds[3]), ")");
        */
        
    }

    update(left, up, right, low) {
        this.bounds = [left * this.adj, up * this.adj, right * this.adj, low * this.adj];
        this.unadjusted = [left, up, right, low];
        this.check();
    }

    rectUpdate(rect) {
        let box = getRelCoords(rect, svg_cont);
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
} 



class word_link {
    constructor(region, word, rect, span) {
        this.region = region;
        this.word = word;
        this.rect = rect;
        this.span = span;
        this.id = this.rect.id;

    }
}