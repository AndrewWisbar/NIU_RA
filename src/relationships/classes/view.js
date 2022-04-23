/**
 * Controller for graphical aspects of the webpage
 */
class View {
    constructor() {
        this.container = document.getElementById('container');
        this.tableSVG = document.getElementById("table-svg");
        this.tableG = document.createElementNS(svgns, "g");
        this.tableSVG.setAttribute("width", this.container.clientWidth)
        this.tableSVG.setAttribute("height", this.container.clientHeight)
        this.tableSVG.appendChild(this.tableG);

        this.contWidth = this.container.clientWidth;
        this.contHeight = this.container.clientHeight;

        this.xSpace = this.contWidth / 5;
        this.ySpace = this.contHeight / GROUP_MAX;

        this.layers = [];
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
        this.cliques = [];
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

        // Clear Graph Container
        this.layers = [];
        this.edges = {};
        this.cliques = [];
        let cont = document.getElementById("container");
        while (cont.firstChild) {
            cont.removeChild(cont.lastChild);
        }

        this.drawLayerBackgrounds(layers);
        this.createNodes(layers);
        this.drawEdges(inter);
        this.drawCliques(inter, layers)
        this.drawNodes(layers);
        this.createTable(layers, inter);
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

    drawEdges(interfaces) {
        //for each layer
        for(let l = 0; l < interfaces.length; l++) {

            let edges = interfaces[l].e;
            
            // for each node in the layer
            for(let i = 0; i < edges.length; i++) {
                //for each connection to another node
                for(let j = 0; j < edges[i].length; j++) {
                    if(edges[i][j].w > 0) {
                        let pos1 = this.layers[l][i];
                        let pos2 = this.layers[l+1][j];


                        let e = new Edge(pos1, pos2, edges[i][j].w, edges[i][j].inClique, this.container);
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

    /**
     * Create the multidimensional SVG table
     * @param {Array} layers An array of integers representing the number of nodes in each layer of the graph 
     * @param {*} interfaces An array of objects representing the connections between two layers of the graph
     */
    createTable(layers, interfaces) {

        while(this.tableG.firstChild) {
            this.tableG.removeChild(this.tableG.lastChild);
        }
        this.tableSVG.appendChild(this.tableG);
        let org = {x: 0, y: 0};

        for(let i = 0; i < layers.length - 1; i++) {
            this.drawTable(layers, i, interfaces[i].e, org);
            (i%2) ? org.y += CELL_H * (parseInt(layers[i]) + 1) : org.x += CELL_W * (parseInt(layers[i]) + 1);
        }
        let table_width = parseInt(layers[0]) + 1;
        if(layers.length >= 3 && layers.length != 5) {
            table_width += parseInt(layers[2]) + 1;
        }
        else if(layers.length == 5) {
            table_width = Math.max(parseInt(layers[0]) + parseInt(layers[2]) + 2,
                                  ((parseInt(layers[0]) + 1) - 
                                  (parseInt(layers[1]) + 1)) + 
                                  parseInt(layers[2]) + parseInt(layers[4]) + 2);
        }
        table_width *= CELL_W;
        table_width *= 0.5;
        table_width *= Math.SQRT2;

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
    drawTable(layers, layer_ind, edges, org) {
        let layer1, l1ind, l2ind, layer2, color1, color2;
        if(layer_ind%2) {
            l1ind = layer_ind + 1;
            l2ind = layer_ind;
            layer1 = parseInt(layers[l1ind]);
            layer2 = parseInt(layers[l2ind]);
            color1 = LAYER_COLS[l1ind];
            color2 = LAYER_COLS[l2ind];
        }
        else
        {
            l1ind = layer_ind;
            l2ind = layer_ind + 1;
            layer1 = parseInt(layers[l1ind]);
            layer2 = parseInt(layers[l2ind]);
            color1 = LAYER_COLS[l1ind];
            color2 = LAYER_COLS[l2ind];

        }

        // Create and color the indivudual boxes
        for(let j = 0; j < layer2 + 1; j++) {
            for(let i = 0; i < layer1 + 1; i++) {
                if(i != 0 || j != 0) {
                    let entry = document.createElementNS(svgns, "rect");
                    this.tableG.appendChild(entry);
                    entry.setAttribute("x", org.x + (i * CELL_W));
                    entry.setAttribute("y", org.y + (j * CELL_H));
                    entry.setAttribute("width", CELL_W);
                    entry.setAttribute("height", CELL_H);
                    entry.setAttribute("stroke", "black")

                    if(i == 0) {
                        entry.setAttribute("fill", color2+"7F")
                        entry.setAttribute("stroke", color2)
                        entry.setAttribute("id", `l${l2ind}n${j-1}_tab`)
                        entry.setAttribute("onmouseover", "selectTableNode(this)");
                        entry.setAttribute("onmouseout", "deselectTableNode(this)");
                    }
                    else if(j == 0) {
                        entry.setAttribute("fill", color1+"7F")
                        entry.setAttribute("stroke", color1)
                        entry.setAttribute("id", `l${l1ind}n${i-1}_tab`)
                        entry.setAttribute("onmouseover", "selectTableNode(this)");
                        entry.setAttribute("onmouseout", "deselectTableNode(this)");
                    }
                    else {
                        entry.setAttribute("fill", NODE_COL)
                        if(l1ind < l2ind) {
                            entry.setAttribute("id", `l${l1ind}n${i-1}l${l2ind}n${j-1}_tab`)
                            if(edges[i-1][j-1].w == 0)
                                entry.setAttribute("fill", "black")
                        }
                        else { 
                            entry.setAttribute("id", `l${l2ind}n${j-1}l${l1ind}n${i-1}_tab`)
                            if(edges[j-1][i-1].w == 0)
                                entry.setAttribute("fill", "black")
                        }
                    }
                }
            }
        }
    }

    /**\
     * 
     */
    drawCliques(interfaces, layers) {
        for(let i = 0; i < interfaces.length; i++) {
            let arr = [];
            for(let c = 0; c < interfaces[i].num_cliques; c++) {
                let clique = interfaces[i].cliques[c];
                let leftNodes = [];
                let rightNodes = [];
                for(let n = 0; n < clique[0].length; n++)
                    leftNodes.push(this.layers[i][clique[0][n]]);

                for(let n = 0; n < clique[1].length; n++)
                    rightNodes.push(this.layers[i+1][clique[1][n]]);

                arr.push(new Clique(leftNodes, rightNodes))
            }

            // Sort array of cliques by ideal height
            arr.sort(function(a, b) {
                return a.idealCenter.y - b.idealCenter.y;
            })

            let height = ((layers[i] > layers[i+1]) ? layers[i] : layers[i + 1]) * this.ySpace;
            let cliqueSpace  = height / interfaces[i].num_cliques;
            
            for(let c = 0; c < interfaces[i].num_cliques; c++) {
                if(interfaces[i].num_cliques == 1)
                    arr[c].setCenter(arr[c].idealCenter.y, this.container)
                else
                    arr[c].setCenter((cliqueSpace * c) + (cliqueSpace / 2), this.container)
            }

            this.cliques.push(arr)
        }

        console.log(this.cliques);
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
        let tab = document.getElementById(this.id + "_tab");
        tab.setAttribute("fill", LAYER_COLS[this.layer]);
        tab.setAttribute("stroke", "black");
    }

    deselect() {
        this.svg.setAttribute("fill", NODE_COL)
        let tab = document.getElementById(this.id + "_tab");
        tab.setAttribute("fill", LAYER_COLS[this.layer] + "7F");
        tab.setAttribute("stroke", LAYER_COLS[this.layer]);
    }


}

class Edge {
    constructor(node1, node2, weight, clique_num, container) {
        this.node1 = node1.id;
        this.node2 = node2.id;
        this.id = this.node1 + this.node2;
        this.clique = clique_num;

        this.x1 = node1.x;
        this.y1 = node1.y;
        this.x2 = node2.x;
        this.y2 = node2.y;
        this.weight = weight;
        this.draw(container);
    }

    draw(cont) {
        this.svg = document.createElementNS(svgns, "line");
        if(this.clique != -1)
            this.svg.setAttribute("opacity", 0);

        cont.appendChild(this.svg);
        this.svg.setAttribute("x1", this.x1);
        this.svg.setAttribute("y1", this.y1);
        this.svg.setAttribute("x2", this.x2);
        this.svg.setAttribute("y2", this.y2);
        this.svg.setAttribute("id", this.id);
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

    getGreyScale() {
        return  `rgba(${(1 - this.weight) * 255}, ${(1 - this.weight) * 255}, 
                ${(1 - this.weight) * 255}, 1)`;
    }

    getColMap() {
        return `rgba(${this.weight < .5 ? 255 : 255 - 255 * 2 * (this.weight - .5)}, 
                ${this.weight >= .5 ? 255 : 255 * 2 * (this.weight)}, 0, 1)`;
    }

    setGreyScale() {
        let col = `rgba(${(1 - this.weight) * 255}, ${(1 - this.weight) * 255}, ${(1 - this.weight) * 255}, 1)`;
        this.svg.setAttribute("stroke-width", 5)
        this.setColor(col);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", col);
    }

    setColMap() {
        let col =  `rgba(${this.weight < .5 ? 255 : 255 - 255 * 2 * (this.weight - .5)}, 
                   ${this.weight >= .5 ? 255 : 255 * 2 * (this.weight)}, 0, 1)`;

        this.svg.setAttribute("stroke-width", 5);
        this.setColor(col);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", col);
    }

    setSize() {
        this.svg.setAttribute("stroke-width", (this.weight * this.weight * 8 + 1) + "px")
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", this.getColMap());
    }

    setDash() {
        this.svg.setAttribute("stroke-dasharray", 14 * (1 - this.weight) + 1);
        this.svg.setAttribute("stroke-width", 5);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", this.getColMap());
    }

    reset() {
        this.setColor("rgba(0,0,0,1)")
        this.svg.setAttribute("stroke-width", 1);
        this.svg.removeAttribute("stroke-dasharray")
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", NODE_COL);
    }
}

class Clique {
    constructor(left, right) {
        this.leftNodes = left;
        this.rightNodes = right;
        this.idealCenter;
        this.svg = null;
        this.finalCenter;

        let leftSum = 0, rightSum = 0;
        this.leftNodes.forEach(node =>{
            leftSum += node.y;
        });

        this.rightNodes.forEach(node =>{
            rightSum += node.y;
        });

        let leftAvg = leftSum / this.leftNodes.length;
        let rightAvg = rightSum / this.rightNodes.length;

        this.idealCenter = {"x": (this.leftNodes[0].x + this.rightNodes[0].x) / 2, 
                            "y": (leftAvg + rightAvg) / 2};
        // Does this clique cause us to draw more or less edges?
        this.good = (this.leftNodes.length + this.rightNodes.length < this.leftNodes.length * this.rightNodes.length)
    }

    setCenter(yPos, cont) {
        this.finalCenter = {x: this.idealCenter.x, y: yPos};
        this.draw(cont);
    }

    draw(cont) {
        
        this.svg = document.createElementNS(svgns, "rect");

        this.svg.setAttribute("x", this.finalCenter.x - (CLIQUE_W / 2))
        this.svg.setAttribute("y", this.finalCenter.y - (CLIQUE_H / 2))
        this.svg.setAttribute("width", CLIQUE_W);
        this.svg.setAttribute("height", CLIQUE_H);
        this.svg.setAttribute("rx", CLIQUE_R);
        this.svg.setAttribute("ry", CLIQUE_R);
        this.svg.setAttribute("fill", "#7b9ead")
        this.svg.setAttribute("stroke", "black")
        
        this.leftNodes.forEach(node => {
            var new_path = d3.path();
            new_path.moveTo(node.x, node.y);
            new_path.bezierCurveTo( ((this.finalCenter.x - node.x) / 2) + node.x, 
                                    node.y,
                                    ((this.finalCenter.x - node.x) / 2) + node.x,
                                    this.finalCenter.y,
                                    this.finalCenter.x,
                                    this.finalCenter.y);

            let path = document.createElementNS(svgns, "path");
            path.setAttribute("stroke", "black")
            path.setAttribute("d", new_path);
            cont.appendChild(path)
        })

        this.rightNodes.forEach(node => {
            var new_path = d3.path();
            new_path.moveTo(node.x, node.y);
            new_path.bezierCurveTo( ((node.x - this.finalCenter.x) / 2) + this.finalCenter.x, 
                                    node.y,
                                    ((node.x - this.finalCenter.x) / 2) + this.finalCenter.x,
                                    this.finalCenter.y,
                                    this.finalCenter.x,
                                    this.finalCenter.y);

            let path = document.createElementNS(svgns, "path");
            path.setAttribute("stroke", "black")
            path.setAttribute("d", new_path);
            cont.appendChild(path)
        })
        cont.appendChild(this.svg)

    }
}