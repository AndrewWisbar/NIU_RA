/**
 * Generate and manage the data needed by the graph
 */
class Data {

    #layers;
    #edges;
    #lcm_params;
    constructor(numLayers, layerSizes, percents, lcm_params) {

        this.#layers = new Array(numLayers);
        this.layerOrder = new Array(numLayers);
        for(let i = 0; i < this.layerOrder.length; i++)
            this.layerOrder[i] = i;
        this.#edges = new Array(numLayers - 1);
        this.#lcm_params = new Array(numLayers - 1);
        this.maxSets = [];
        this.interfaces = [];

        this.dataSentNum = 0;
        this.dataReturnedNum = 0;

        for(let g = 0; g < this.#layers.length; g++) 
            this.#layers[g] = layerSizes[g];

        for(let e = 0; e < this.#edges.length; e++)
            this.#edges[e] = [];

        this.update(layerSizes, percents, lcm_params)
    }

    /**
     * Get the edges in the graph
     * @returns the array of edges in the graph
     */
    getEdges() {
        return this.#edges;
    }

    /**
     * Get the number of nodes in each layer of the graph
     * @returns an array representing the number of nodes in each layer of the graph
     */
    getLayers() {
        return cloneArray(this.#layers);
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
    update(layerSizes, edgePercents, lcm_params) {
        this.#layers = layerSizes;
        this.#edges = this.generateEdges(layerSizes, edgePercents);
        this.#lcm_params = lcm_params;
    }

    generate(layerSizes, edgePercents, lcm_params) {
        this.dataSentNum = 0;
        this.dataReturnedNum = 0;
        this.layerOrder = new Array(layerSizes.length)
        for(let i = 0; i < layerSizes.length; i++) {
            this.layerOrder[i] = i;
        }
        this.update(layerSizes, edgePercents, lcm_params);
        this.#send();
    }

    /**
     * Generate the edges for each set of adjacent layers in the graph
     * @param {Array<int>} layerSizes number of nodes in each layer
     * @param {Array<Float>} percents the percentage of edges to generate for each set of adjacent layers
     * @returns 
     */
    generateEdges(layerSizes, percents) {
        let arr = new Array(layerSizes.length)
        for(let j = 0; j < arr.length; j++) {
            let subarr = new Array(layerSizes.length);
            for(let i = 0; i < subarr.length; i++) {
                if(!(i == j))
                    subarr[i] = this.createEdgeArr(layerSizes[j], layerSizes[i], (percents[j] / 100.0));
            }
            arr[j] = subarr;
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
    getEdgeSet(ind1) {
        if(ind1 < 0 || ind1 > this.#edges.length - 1)
            return false;
        if(ind2 < 0 || ind2 > this.#edges.length - 1)
            return false;
        return this.#edges[ind1][ind2];    
    }

    /**
     * Get the number of nodes in a layer of the graph
     * @param {Integer} ind index of the layer to check
     * @returns the number of nodes in the layer or "false"
     */
    getNumNodes(ind) {
        if(ind < 0 || ind > this.#layers.length - 1)
            return false;

        return this.#layers[ind];   
    }

    /**
     * Send data to the server to be processed by LCM program
     */
    #send() {
        //init maxSets array
        this.maxSets = new Array(this.layerOrder.length)
        for(let i = 0; i < this.maxSets.length; i++)
            this.maxSets[i] = new Array(this.layerOrder.length)

            // For each combonation of layers
            for(let l = 0; l < this.#layers.length; l++) {
                for(let k = 0; k < this.#layers.length; k++) {
                    if(l != k) {
                    // Parse the edges into a formated string for use by the LCM program
                    let dataString = "";
                    for(let i = 0; i < this.#edges[l][k].length; i++) {
                        let substr = "";
                        for(let j = 0; j < this.#edges[l][k][i].length; j++) {
                            if(this.#edges[l][k][i][j] != 0) {
                                if(substr.length > 0)
                                    substr += ',';
                                substr += j;
                            }
                        }
                        substr += "\n";
                        dataString += substr;
                    }
                    /* Using asynchronous execution would be much more effecient,
                     * however, the LCM program only accepts input from files,
                     * which would make asynchronus execution impractical.
                     */
                    $.ajax({
                        type: "GET",
                        url: "../PHP/process_data.php",
                        data: {data: dataString, param: this.#lcm_params[l], from: l, to: k},
                        async: false, 
                        dataType: "html",
                        success: catchData
                    })

                    //this.dataSentNum++;
                }
            }
        }
    }

    /**
     * Recieve one set of output from LCM and parse it
     * @param {String} data 
     */
    storeData(data) {
        // console.log("Recieved Data: ", data)
        let arr = Array();
        let lines = data.split(/\r?\n/);

        lines.splice(lines.length - 1, 1);
        let inds = lines[0].split(" ")
        for(let i = 0; i < inds.length; i++)
            inds[i] = parseInt(inds[i], 10);


        for(let l = 1; l < lines.length; l += 2) {
            let node_inds2 = strToNumArr(lines[l]);
            let node_inds1 = strToNumArr(lines[l+1]);
            arr.push([node_inds1, node_inds2])
        }
        this.maxSets[inds[0]][inds[1]] = arr;
        //this.dataReturnedNum++;
    }

    /**
     * Create the LayerInterface objects that represent the connections in the 
     *  graph
     */
    fillInterfaces() {
        // console.log("Edges", this.#edges)
        // console.log("Max Sets", this.maxSets)
        this.interfaces = new Array(this.layerOrder.length);
        for(let i = 0; i < this.interfaces.length; i++)
            this.interfaces[i] = new Array(this.layerOrder.length);
        
        for(let i = 0; i < this.maxSets.length; i++)
            for(let j = 0; j < this.maxSets.length; j++)
                if(i != j) {
                    // console.log("index", i, j)
                    // console.log("subset Edges: ", this.#edges[i][j])
                    this.interfaces[i][j] = (new LayerInterface
                                            (this.#layers[i], 
                                            this.#layers[j], 
                                            [i,j],  
                                            this.maxSets[i][j],
                                            this.#edges[i][j]))
                }
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
        console.log(this.#layers)
        console.log("Edges: ")
        console.log(this.#edges)
        console.log("Interfaces:")
        console.log(this.interfaces)
    }
}