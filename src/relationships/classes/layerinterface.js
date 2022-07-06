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
        this.laInd = layerInd[0];
        this.lbInd = layerInd[1];
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
                arr[i][j] = {"w": edges[i][j], "inClique": []}
            }
        }
        return arr;
    }
    /**
     * Mark any edges that are included in a clique
     */
    filterEdges() {
        // console.log(this.cliques)
        for(let c = 0; c < this.cliques.length; c++) {
            // console.log(this.laInd, this.lbInd, "Clique: " + c);
            let clique = this.cliques[c]
            for(let i = 0; i < clique[0].length; i++) 
                for(let j = 0; j < clique[1].length; j++) {
                    // console.log("Left ", i, " Right ", j, clique[0][i], clique[1][j])
                    this.e[clique[0][i]][clique[1][j]].inClique.push(c);
                }
        }
    }
};