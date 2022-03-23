/**
 * Generate and manage the data used by the graph
 */
class Data {
    constructor(numLayers, layerSizes, percents) {
        this.layers = new Array(numLayers);
        this.edges = new Array(numLayers - 1);
        this.maxSets = []
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

        for(let i = 0; i < Math.round(shuffled.length * percent); i++)
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
                substr += " \n";
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

    storeData(data) {
        this.maxSets.push(data)
    }

    log() {
        console.log("Layers: ")
        console.log(this.layers)

        console.log("Edges: ")
        console.log(this.edges)
    }
}



/**
 * Given an array shuffle its contents into a random order
 * @param {Array} array an array to shuffle
 * @returns the a shuffled version of the original array
 */
 function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}