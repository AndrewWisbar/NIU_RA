/**
 * Generate and manage the data needed by the graph
 */
class Data {
    constructor(numLayers, layerSizes, percents) {
        this.layers = new Array(numLayers);
        this.edges = new Array(numLayers - 1);
        this.maxSets = [];
        this.interfaces = [];
        for(let g = 0; g < this.layers.length; g++) 
            this.layers[g] = layerSizes[g];

        for(let e = 0; e < this.edges.length; e++)
            this.edges[e] = [];

        this.update(layerSizes, percents)
    }

    /**
     * Get the edges in the graph
     * @returns the array of edges in the graph
     */
    getEdges() {
        return this.edges;
    }

    /**
     * Get the number of nodes in each layer of the graph
     * @returns an array representing the number of nodes in each layer of the graph
     */
    getLayers() {
        return this.layers;
    }

    /**
     * Get the LayerInterface objects for each adjacent set of layers
     * @returns an array of interface objects
     */
    getInterfaces() {
        return this.interfaces;
    }

    /**
     * Update the number of nodes in each layer, and percentage of present edges 
     *  in each LayerInterface
     * @param {Array<Integer>} layerSizes array of integers, representing the 
     *  number of nodes in each layer
     * @param {Array<Float32>} edgePercents array of percentages of edges 
     *  present between each layer respectively
     */
    update(layerSizes, edgePercents) {
        this.layers = layerSizes;
        this.edges = this.generateEdges(layerSizes, edgePercents);

    }

    /**
     * Generate the edges for each set of adjacent layers in the graph
     * @param {Array<int>} layerSizes number of nodes in each layer
     * @param {Array<Float>} percents the percentage of edges to generate for each set of adjacent layers
     * @returns 
     */
    generateEdges(layerSizes, percents) {
        let arr = new Array(layerSizes.length - 1)
        for(let i = 0; i < percents.length; i++) {
            arr[i] = this.createEdgeArr(layerSizes[i], layerSizes[i+1], (percents[i] / 100.0));
        }

        return arr;
    }

    /**
     * Create an array representing the weight of each edge
     * @param {Integer} nodes1 The number of nodes in the first layer
     * @param {Integer} nodes2 The number of nodes in the second layer 
     * @param {Float} percent the percentage of edges that should have a 
     *  non-zero weight
     * @returns An array of floats representing the weight of each edge
     */
    createEdgeArr(nodes1, nodes2, percent) {
        let arr = new Array(nodes1);
        for(let i = 0; i < nodes1; i++) {
            let subarr = new Array(nodes2);
            for(let j = 0; j < nodes2; j++)
                subarr[j] = 0;
            
            arr[i] = subarr;
        }
        let potEdges = [];
        for(let i = 0; i < nodes1; i++) {
            for(let j = 0; j < nodes2; j++) {
                potEdges.push({"i": i, "j": j});
            }
        }

        let shuffled = shuffle(potEdges);
        let numEdges = Math.max(1,  Math.round(shuffled.length * percent));
        for(let i = 0; i < numEdges; i++)
            arr[shuffled[i].i][shuffled[i].j] = Math.random(); // Assign weight

        return arr;
    }

    /**
     * Get a specific set of edges from the graph
     * @param {Integer} ind index of the array to return 
     * @returns an array of edges or "false"
     */
    getEdgeSet(ind) {
        if(ind < 0 || ind > this.edges.length - 1)
            return false;

        return this.edges[ind];    
    }

    /**
     * Get the number of nodes in a layer of the graph
     * @param {Integer} ind index of the layer to check
     * @returns the number of nodes in the layer or "false"
     */
    getNumNodes(ind) {
        if(ind < 0 || ind > this.layers.length - 1)
            return false;

        return this.layers[ind];   
    }

    /**
     * Send data to the server to be processed by LCM program
     */
    send() {
        // turn data into string
        this.maxSets = [];
        for(let l = 0; l < this.edges.length; l++) {
            let dataString = ""
            for(let i = 0; i < this.edges[l].length; i++) {
                let substr = "";
                for(let j = 0; j < this.edges[l][i].length; j++) {
                    if(this.edges[l][i][j] != 0) {
                        if(substr.length > 0)
                            substr += ',';
                        substr += j;
                    }
                }
                substr += "\n";
                dataString += substr;
            }

            // send the data to a php script
            $.ajax({
                type: "GET",
                url: "../PHP/process_data.php",
                data: {data: dataString},
                async: false, // for simplicity we aren't using async for now
                dataType: "html",
                success: catchData
            })
        }

    }

    /**
     * Recieve one set of output from LCM and parse it
     * @param {String} data 
     */
    storeData(data) {
        let arr = Array();
        let lines = data.split(/\r?\n/);
        lines.splice(lines.length - 1, 1);

        for(let l = 0; l < lines.length; l += 2) {
            let node_inds2 = strToNumArr(lines[l]);
            let node_inds1 = strToNumArr(lines[l+1]);
            arr.push([node_inds1, node_inds2])
        }
        this.maxSets.push(arr);
    }

    /**
     * Create the LayerInterface objects that represent the connections in the 
     *  graph
     */
    fillInterfaces() {
        this.interfaces = [];
        
        for(let i = 0; i < this.maxSets.length; i++)
            this.interfaces.push(new LayerInterface(this.layers[i], this.layers[i+1], i, this.maxSets[i], this.edges[i]))

        this.maxSets = [];

    }

    /**
     * Log debug info to the console.
     */
    log() {
        console.log("~~~~~~~~~~~~~~");
        console.log("Data Log")
        console.log("~~~~~~~~~~~~~~");
        console.log("Layers: ")
        console.log(this.layers)
        console.log("Edges: ")
        console.log(this.edges)
        console.log("Interfaces:")
        console.log(this.interfaces)
    }
}