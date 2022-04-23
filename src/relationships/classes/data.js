/**
 * Generate and manage the data used by the graph
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

    getEdges() {
        return this.edges;
    }

    getLayers() {
        return this.layers;
    }

    getInterfaces() {
        return this.interfaces;
    }

    update(layerSizes, edgePercents) {
        this.layers = layerSizes;
        this.edges = this.generateEdges(layerSizes, edgePercents);

    }

    generateEdges(layerSizes, percents) {
        let arr = new Array(layerSizes.length - 1)
        for(let i = 0; i < percents.length; i++) {
            arr[i] = this.createEdgeArr(layerSizes[i], layerSizes[i+1], (percents[i] / 100.0));
        }

        return arr;
    }

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
            arr[shuffled[i].i][shuffled[i].j] = Math.random();

        return arr;
    }

    getEdgeSet(ind) {
        if(ind < 0 || ind > this.edges.length - 1)
            return false;

        return this.edges[ind];    
    }

    getNumNodes(ind) {
        if(ind < 0 || ind > this.layers.length - 1)
            return false;

        return this.layers[ind];   
    }

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

            $.ajax({
                type: "GET",
                url: "../PHP/process_data.php",
                data: {data: dataString},
                async: false,
                dataType: "html",
                success: catchData // this seems clunky and not ideal
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

    fillInterfaces() {
        this.interfaces = [];
        
        for(let i = 0; i < this.maxSets.length; i++)
            this.interfaces.push(new LayerInterface(this.layers[i], this.layers[i+1], i, this.maxSets[i], this.edges[i]))

        this.maxSets = [];

    }


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


/**
 * An object representing the connection between two layers
 */
class LayerInterface {
    constructor(layerA, layerB, layerInd, cliques, edges) {
        this.la = cloneArray(layerA);
        this.lb = cloneArray(layerB);
        this.cliques = cloneArray(cliques);
        this.num_cliques = this.cliques.length;
        this.e = this.convertEdges(edges);
        this.laInd = layerInd;
        this.lbInd = layerInd + 1;
        this.filterEdges();
    }

    /**
     * Convert Edges from a list of weights, to a list of objects
     * @param {Array} edges a two dimensional array of edge weights 
     * @returns a two dimentional array of objects
     */
    convertEdges(edges) {
        let arr = new Array(edges.length);
        for(let i = 0; i < edges.length; i++) {
            arr[i] = new Array(edges[i].length);
            for(let j = 0; j < edges[i].length; j++) {
                arr[i][j] = {"w": edges[i][j], "inClique": -1}
            }
        }
        return arr;
    }
    /**
     * Mark any edges that are included in a clique
     */
    filterEdges() {
        for(let c = 0; c < this.cliques.length; c++) {
            let clique = this.cliques[c]
            for(let i = 0; i < clique[0].length; i++)
                for(let j = 0; j < clique[1].length; j++)
                    this.e[clique[0][i]][clique[1][j]].inClique = c;
        }
    }
};