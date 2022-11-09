/**
 * Controller for graphical aspects of the webpage
 */
class View {
    constructor() {
        this.graphView = new GraphPane(document.getElementById('container'));
        this.tableView = new TablePane(document.getElementById("table-svg"));

        this.layerOrder = [];

        var self = this;

        // Layer Visibility Methods 
        document.getElementById("edges-check").onclick = function() {self.graphView.toggleEdges(this)}
        document.getElementById("cliques-check").onclick = function() {self.graphView.toggleCliques(this)}
        document.getElementById("missingedges-check").onclick = function() {self.graphView.toggleMissingEdges(this)}
    }

    /**
     * Display a Loading message in the graph container svg.
     * 
     * This method additionally clears, and resets the viewbox for both svg containers
     */
    displayLoading() {
        // Reset view box attributes
        this.graphView.reset();
        this.tableView.reset();

        this.graphView.displayLoading();
    }

    /**
     * Store and render the information sent to this object
     * 
     * The edges array sent to this method is rearranged and stored as an
     * object where each key is a nodes id, and each value is an array of edges
     * connected to that node.
     * 
     * @param {Array} layers an array representing the number of nodes in each
     *     layer
     * @param {Array} inter an array of edge interface objects
     *  
     */
    renderGraph(layers, inter) {
        this.determineLayerOrder(layers.length)

        this.layers = [];
        this.edges = {};
        this.cliques = [];

        this.graphView.render(layers, this.layerOrder, inter);
        console.log(this.graphView.getLayers())
        this.tableView.createTable(layers, this.layerOrder, inter, this.graphView.getLayers(), this.graphView.getLayers());
    }

    /**
     * Determine the order of layers in the graph
     * 
     * This method is called when rendering a new graph,
     * This method is not used when the user manipulates the order of an existing graph
     * 
     * @param {Number} length the number of layers in the graph (length of the array) 
     */
    determineLayerOrder(length) {
        if(this.layerOrder) {
            let oldOrder = this.layerOrder;
            this.layerOrder = new Array(length);
            for(let i = 0; i < length; i++) {
                if(i < oldOrder.length)
                    this.layerOrder[i] = oldOrder[i];
                else
                    this.layerOrder[i] = i;
            }
        }
        else {
            this.layerOrder = new Array(length);
            for(let i = 0; i < this.layerOrder.length; i++)
                this.layerOrder[i] = i;
        }
    }

    getNode(id) {
        return this.graphView.getNode(id);
    }

    selectNode(id, type, clique) {
        this.graphView.selectNode(id, type, clique, this.layerOrder);
    }

    recursiveSelect(id, type, propagation) {
        this.graphView.recursiveSelect(id, type, propagation, this.layerOrder);
    }

    recursiveDeselect(id, type, propagation) {
        this.graphView.recursiveDeselect(id, type, propagation, this.layerOrder);
    }

    deselectNode(id) {
        this.graphView.deselectNode(id, this.layerOrder);
    }

    selectClique(id, type) {
        this.graphView.selectClique(id, type);
    }

    deselectClique(id) {
        this.graphView.deselectClique(id);
    }

    swapColumns(layer1, layer2) {
        let ind1 = this.layerOrder.indexOf(layer1);
        let ind2 = this.layerOrder.indexOf(layer2);
        this.layerOrder[ind1] = layer2;
        this.layerOrder[ind2] = layer1;
    }

    startDragColumn(ind) {
        this.container.mousemove = null;
        this.container.mouesup = null;
    }

    zoom(dY, path) {
        if(path.includes(this.tableView.getSVG())) {
            this.tableView.zoom(dY);
        }
        if(path.includes(this.graphView.getSVG())) {
            this.graphView.zoom(dY);
        }
    }
    
    startPan(x, y, target) {
        if(target == this.graphView.getSVG())
            this.graphView.startPan(x, y);
        else if (target == this.tableView.getSVG())
            this.tableView.startPan(x,y);
        
    }

    pan(x, y, path) {


        if(path.includes(this.tableView.getSVG())) {
            this.tableView.pan(x, y);
        }


        if(path.includes(this.graphView.getSVG())) {
            this.graphView.pan(x, y);
        }
    }

    endPan(path) {
        this.graphView.endPan();
        this.tableView.endPan();
    }

    getLayerOrder() {
        return this.layerOrder;
    }

    getLayers() {
        return this.graphView.getLayers();
    }

    getClique(id) {
        return this.graphView.getClique(id);
    }
    
    getGraphView() {
        return this.graphView();
    }

    dragCliqueStart(id, pos) {
        this.graphView.dragCliqueStart(id, pos);
    }

    dragClique(id, pos) {
        this.graphView.dragClique(id, pos);
    }

    dragCliqueEnd(id) {
        this.graphView.dragCliqueEnd(id);
    }
}
