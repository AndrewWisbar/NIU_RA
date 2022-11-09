class TablePane extends SVGPane {
    constructor(svg) {
        super(svg);
        this.tables = [];

        this.tableG = document.createElementNS(svgns, "g");
        this.svg.appendChild(this.tableG);
    }

    /**
     * Create the multidimensional SVG table
     * @param {Array} layerNums An array of integers representing the number of nodes in each layer of the graph 
     * @param {*} interfaces An array of objects representing the connections between two layers of the graph
     */
     createTable(layerNums, order, interfaces, layerObjs, nodes) {
        // DrawnFlags will be used to determine which layers headers still need to be drawn
        let drawnFlags = new Array(layerNums.length);
        for(let l = 0; l < layerNums.length; l++) {
            drawnFlags[order[l]] = 1;
        }
        
        // Clear the table
        while(this.tableG.firstChild) {
            this.tableG.removeChild(this.tableG.lastChild);
        }

        // Make a group for the table
        this.svg.appendChild(this.tableG);
        

        let org = {x: 0, y: 0};
        
        //For each set of adjacent layers
        for(let l = 0; l < layerNums.length - 1; l++) {
            let i = order[l];
            let j = order[l+1];
            this.drawTable(l, interfaces[i][j].e, org, drawnFlags, layerObjs, order, nodes);
            
            // Determine the next origin point
            let offset = {x:0, y:0};
            if(l%2) { // if the index is odd, move the origin vertically
                offset.y += (parseInt(layerNums[i]) + 1);
                if(l%4) // only every fourth layer will have a vertical header 
                    offset.x -= 1;
            }
            else { // if the index is even, move the origin horizontally
                offset.x += (parseInt(layerNums[i]) + 1);
                if(l > 0) // for all layers other than zero, offset header row
                    offset.y -= 1;
            }
            org.x += CELL_W * offset.x;
            org.y += CELL_H * offset.y;
            drawnFlags[i] = 0;
            drawnFlags[j] = 0;
        }

        // Determine the width of the table
        let table_width = parseInt(layerNums[order[0]]) + 1;
        if(layerNums.length >= 3 && layerNums.length != 5) {
            table_width += parseInt(order[2]) + 1;
        }
        else if(layerNums.length == 5) {
            table_width = Math.max(parseInt(layerNums[order[0]]) + parseInt(layerNums[order[2]]) + 2,
                                  ((parseInt(layerNums[order[0]]) + 1) - 
                                  (parseInt(layerNums[order[1]]) + 1)) + 
                                  parseInt(layerNums[order[2]]) + parseInt(layerNums[order[4]]) + 2);
        }
        table_width *= CELL_W;
        table_width *= 0.5;
        table_width *= Math.SQRT2;


        // rotate the table 45 degrees
        let str = `translate(0, ${table_width})\nrotate(-45, 0, 0)`
        this.tableG.setAttribute("transform", str)
    }

    /**
     * Draw an individual 2d matrix as a component of the overall table
     * @param {Array} layers an array representing the number of nodes in each layer of the graph
     * @param {Int} layer_ind the index of the first layer we will draw
     * @param {Array} edges an array of objects representing edges in the table
     * @param {Object} org the origin point of this individual matrix
     */
    drawTable(layer_ind, edges, org, drawnFlags, layers, order, nodes) {
        let l1ind, l2ind, color1, color2;

        // for every other layer, the layer on the top vs. on the side needs to be swapped
        if(layer_ind%2) {
            l1ind = order[layer_ind + 1];
            l2ind = order[layer_ind];
            color1 = ColorMapper.getLayerColor(l1ind);
            color2 = ColorMapper.getLayerColor(l2ind);
        }
        else
        {
            l1ind = order[layer_ind];
            l2ind = order[layer_ind + 1];
            color1 = ColorMapper.getLayerColor(l1ind);
            color2 = ColorMapper.getLayerColor(l2ind);
            
        }
        
        let l = [layers[l1ind].getNumNodes(), 
                 layers[l2ind].getNumNodes()];
        let c = [color1, color2]
        let id_ord = [order[layer_ind], order[layer_ind + 1]]
        let flags = [drawnFlags[l1ind], drawnFlags[l2ind]];

        // Create and color the indivudual boxes
        this.tables.push(new Table(l, edges, org, flags, c, layer_ind, l1ind, l2ind, id_ord, this.tableG, [nodes[l1ind], nodes[l2ind]]))
    }
}