/******************************************************************************
 ******************************Class Definitions*******************************
 *****************************************************************************/

 class selected_region {

    constructor(left, up, right, low, id) {
        let adj = base_img.naturalWidth / base_img.width
        this.bounds = [left * adj, up * adj, right * adj, low * adj];
        this.id = id;
    }

    // called after a user selects a portion of the image
    check() {
        var ratio;

        //if the width of the selection is greator
        if((this.bounds[2] - this.bounds[0]) > (this.bounds[3] - this.bounds[1])) {
            pre_canvas.width = 1000;

            //get the ratio of width/height
            ratio = pre_canvas.width / (this.bounds[2] - this.bounds[0]);

            //set the height of the canvas to the appropriate size
            pre_canvas.height = pre_canvas.width * ((this.bounds[3] - this.bounds[1]) / (this.bounds[2] - this.bounds[0]));
        } else {
            pre_canvas.height = 1000;

            //get the ratio of height/width
            ratio = pre_canvas.height / (this.bounds[3] - this.bounds[1]);

            //set the width of the canvas based on the ratio
            pre_canvas.width = pre_canvas.height * ((this.bounds[3] - this.bounds[1]) / (this.bounds[2] - this.bounds[0]));
        }

        //draw the image
        pre_ctx.drawImage(base_img, this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0],
            this.bounds[3] - this.bounds[1], 0, 0,
            pre_canvas.width,
            pre_canvas.height);

        //log the bounds of the selection
        console.log("(", Math.floor(this.bounds[0]), ", ",
            Math.floor(this.bounds[1]), ")  (", 
            Math.floor(this.bounds[2]), ", ", 
            Math.floor(this.bounds[3]), ")");
    }
} 



class word_link {
    constructor(region, word) {
        this.region = region;
        this.word = word;
    }
}