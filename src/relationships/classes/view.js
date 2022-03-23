/**
 * Controller for graphical aspects of the webpage
 */
class View {
    constructor() {
        this.container = document.getElementById('container');

        this.contWidth = this.container.clientWidth;
        this.contHeight = this.container.clientHeight;

        this.xSpace = this.contWidth / 5;
        this.ySpace = this.contHeight / GROUP_MAX;

        this.layers = [];
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
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
     * @param {*} edges a three dimensional array of all the connections in the
     *     graph 
     */
    renderGraph(layers, edges) {

        // Clear Graph Container
        this.layers = [];
        this.edges = {};
        let cont = document.getElementById("container");
        while (cont.firstChild) {
            cont.removeChild(cont.lastChild);
        }

        this.drawLayerBackgrounds(layers);
        this.createNodes(layers);
        this.drawEdges(edges);
        this.drawNodes(layers);
    }

    /**
     * Draw transparent colored rectangles to help identify graph layers on the table
     * @param {Array} layers array of the size of each layer of nodes 
     */
    drawLayerBackgrounds(layers) {
        for(let i = 0; i < layers.length; i++) {
            let rect = document.createElementNS(svgns, "rect");
            this.container.appendChild(rect);
            rect.setAttribute("x", this.xSpace * i + (this.xSpace * (NODE_SIZE + NODE_SIZE/2)));
            rect.setAttribute("y", 0);
            rect.setAttribute("width", this.xSpace * NODE_SIZE);
            rect.setAttribute("height", this.ySpace * layers[i]);
            rect.setAttribute("fill", LAYER_COLS[i]);
            rect.setAttribute("opacity", 0.25)
        }
    }

    createNodes(layers) {
        for(let i = 0; i < layers.length; i++) {
            let arr = [];
            for(let j = 0; j < layers[i]; j++) {
                let node = new Node((.5 * this.xSpace) + i * this.xSpace, 
                                    this.ySpace * j + .5 * this.ySpace, 
                                    this.ySpace * .25, i, j);
                //node.draw(this.container);
                arr.push(node);
            }
            this.layers.push(arr);
        }
    }

    drawNodes(layers) {
        for(let i = 0; i < layers.length; i++) {
            for(let j = 0; j < layers[i]; j++) {
                this.layers[i][j].draw(this.container);
            }
        } 
    }

    drawEdges(edges) {
        //for each layer
        for(let l = 0; l < edges.length; l++) {
            // for each node in the layer
            for(let i = 0; i < edges[l].length; i++) {
                //for each connection to another node
                for(let j = 0; j < edges[l][i].length; j++) {
                    if(edges[l][i][j] > 0) {
                        let pos1 = this.layers[l][i];
                        let pos2 = this.layers[l+1][j];
                        let e = new Edge(pos1, pos2, edges[l][i][j], this.container);
                        if(!(("l" + l + "n" + i) in this.edges)) {
                            this.edges["l" + l + "n" + i] = [];
                            this.edges["l" + l + "n" + i].push(e);
                        }
                        else
                            this.edges["l" + l + "n" + i].push(e)

                        if(!(("l" + (l + 1) + "n" + j) in this.edges)) {
                            this.edges["l" + (l + 1) + "n" + j] = [];
                            this.edges["l" + (l + 1) + "n" + j].push(e)
                        }
                        else 
                            this.edges["l" + (l + 1) + "n" + j].push(e)

                    }
                }
                
            }
        }    
    }

    getNode(id) {
        let nums = idToIndex(id);
        return this.layers[nums.l][nums.n];
    }

    select(id, type) {
        let node = this.getNode(id);
        node.select();
        let edges = this.edges[id];
        if(edges)
            edges.forEach(edge => {
                switch(type) {
                    default:
                    case "def":
                        edge.setColMap();
                        break;

                    case "gry":
                        edge.setGreyScale();
                        break;
                    
                    case "sze":
                        edge.setSize();
                        break;
                    
                    case "dsh":
                        edge.setDash();
                        break;
                }
                
            });
    }

    deselect(id) {
        let node = this.getNode(id);
        node.deselect();
        let edges = this.edges[id];
        if(edges)
            edges.forEach(edge => {
                edge.reset();
            });
    }

    recursiveSelect(id, type) {
        let node = this.getNode(id);
        node.select();
        let edges = this.edges[id];
        if(edges)
            edges.forEach(edge => {
                switch(type) {
                    default:
                    case "def":
                        edge.setColMap();
                        break;

                    case "gry":
                        edge.setGreyScale();
                        break;
                    
                    case "sze":
                        edge.setSize();
                        break;
                    
                    case "dsh":
                        edge.setDash();
                        break;
                }
                this.recursiveSelect(edge.getOtherID(id), type)
            });
    }
}


/**
 * Represtntative of a single node in a graph
 */
 class Node {
    constructor(x, y, r, layer, number) {
        this.x = x;
        this.y = y;
        this.r = r;

        this.svg = null;

        this.layer = layer;
        this.number = number;
        this.id = "l" + layer + "n" + number;
    }

    /**
     * Draw a representation of this node to show to the user
     * @param {HTMLElement} cont the SVG container the node is to be drawn in
     */
    draw(cont) {
        this.svg = document.createElementNS(svgns, "circle");
        cont.appendChild(this.svg);
        this.svg.setAttribute("cx", this.x);
        this.svg.setAttribute("cy", this.y);
        this.svg.setAttribute('r', this.r);
        this.svg.setAttribute('id', this.id);
        this.svg.setAttribute("fill", NODE_COL);
        this.svg.setAttribute("stroke", 'rgb(0, 0, 0)');
        this.svg.setAttribute("onmouseover", "select_node(this)");
        this.svg.setAttribute("onmouseout", "deselect_node(this)");
    }

    /**
     * Get method for the physical screen location of this node
     * @returns object representing the position of the node on the screen
     */
    getPos() {
        return { x: this.x, y: this.y };
    }

    /**
     * Get method for graph position of this node
     * @returns representing the position of the node in the graph
     */
    getGraphPos() {
        return {l: this.layer, n: this.number}    
    }

    select() {
        this.svg.setAttribute("fill", LAYER_COLS[this.layer]);
    }

    deselect() {
        this.svg.setAttribute("fill", NODE_COL)
    }


}

class Edge {
    constructor(node1, node2, weight, container) {
        this.node1 = node1.id;
        this.node2 = node2.id;
        
        this.x1 = node1.x;
        this.y1 = node1.y;
        this.x2 = node2.x;
        this.y2 = node2.y;
        this.weight = weight;
        this.draw(container);
    }

    draw(cont) {
        this.svg = document.createElementNS(svgns, "line");
        cont.appendChild(this.svg);
        this.svg.setAttribute("x1", this.x1);
        this.svg.setAttribute("y1", this.y1);
        this.svg.setAttribute("x2", this.x2);
        this.svg.setAttribute("y2", this.y2);
        this.setColor("black")
    }

    setColor(col) {
        this.svg.setAttribute("stroke", col);
    }

    getWeight() {
        return this.weight;
    }

    getOtherID(id) {
        if(id != this.node1 && id != this.node2)
            return false;
        
        return (id == this.node1) ? this.node2 : this.node1;
    }

    setGreyScale() {
        let col = `rgba(${(1 - this.weight) * 255}, ${(1 - this.weight) * 255}, ${(1 - this.weight) * 255}, 1)`;
        this.svg.setAttribute("stroke-width", 5)
        this.setColor(col);
    }

    setColMap() {
        let col =  `rgba(${this.weight < .5 ? 255 : 255 - 255 * 2 * (this.weight - .5)}, 
                   ${this.weight >= .5 ? 255 : 255 * 2 * (this.weight)}, 0, 1)`;

        this.svg.setAttribute("stroke-width", 5);
        this.setColor(col);
    }

    setSize() {
        this.svg.setAttribute("stroke-width", (this.weight * this.weight * 8 + 1) + "px")
    }

    setDash() {
        this.svg.setAttribute("stroke-dasharray", 14 * (1 - this.weight) + 1);
        this.svg.setAttribute("stroke-width", 5);
    }

    reset() {
        this.setColor("rgba(0,0,0,1)")
        this.svg.setAttribute("stroke-width", 1);
        this.svg.removeAttribute("stroke-dasharray")
    }
}