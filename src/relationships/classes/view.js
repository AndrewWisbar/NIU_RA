/**
 * Controller for graphical aspects of the webpage
 */
class View {
    constructor() {
        this.container = document.getElementById('container');
        this.vbGraph = {"min_x": 0, "min_y": 0, "width": this.container.clientWidth, "height": this.container.clientHeight};
        this.setViewBox(this.container, this.vbGraph);
        
        this.container.onwheel = zoom;
        this.container.onmousedown = startPan;

        this.tableSVG = document.getElementById("table-svg");
        this.tableSVG.onwheel = zoom;
        this.tableSVG.onmousedown = startPan;
        this.vbTable = {"min_x": 0, "min_y": 0, "width": this.tableSVG.clientWidth, "height": this.tableSVG.clientHeight};

        this.tableG = document.createElementNS(svgns, "g");
        this.tableSVG.setAttribute("width", this.container.clientWidth)
        this.tableSVG.setAttribute("height", this.container.clientHeight)
        this.tableSVG.appendChild(this.tableG);
        this.tables = [];

        this.contWidth = this.container.clientWidth;
        this.contHeight = this.container.clientHeight;

        this.xSpace = this.contWidth / 5;
        this.ySpace = this.contHeight / GROUP_MAX;

        this.layers = []; // Hold the nodes contained in each layer
        this.layerGroups = []; // hold SVG groups for each layer of nodes
        this.layerOrder = []; // given a positional index returns layer in that position
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
        this.cliques = []; // hold all the cliques in the graph

        this.cliqueView = true;
        this.showAllCliques = true;
    }

    /**
     * Display a Loading message in the graph container svg.
     * 
     * This method additionally clears, and resets the viewbox for both svg containers
     */
    displayLoading() {
        // Reset view box attributes
        this.vbGraph = {"min_x": 0, "min_y": 0, "width": this.container.clientWidth, "height": this.container.clientHeight};
        this.vbTable = {"min_x": 0, "min_y": 0, "width": this.tableSVG.clientWidth, "height": this.tableSVG.clientHeight};
        this.setViewBox(this.tableSVG, this.vbTable);
        this.setViewBox(this.container, this.vbGraph);

        // Empty the containers
        clearElementChildren(this.container);
        clearElementChildren(this.tableSVG);
        
        // Create and display text
        let text = document.createElementNS(svgns, "text");
        text.innerHTML = "Loading ...";
        text.style.font = "bold 30px sans-serif";

        text.setAttribute("x", (this.container.clientWidth / 2) - (text.clientWidth / 2))
        text.setAttribute("y", (this.container.clientHeight / 2) - (text.clientHeight / 2))
        this.container.appendChild(text);
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

        // Clear Graph Container
        clearElementChildren(this.container);

        this.drawLayerBackgrounds(layers);
        this.createNodes(layers);
        this.drawEdges(inter);
        this.drawCliques(inter, layers)
        this.drawNodes(layers);
        this.createTable(layers, inter);
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

    /**
     * Draw transparent colored rectangles to help identify graph layers on the table
     * @param {Array} layers array of the size of each layer of nodes 
     */
    drawLayerBackgrounds(layers) {
        this.layerGroups = new Array(layers.length);
        for(let l = 0; l < layers.length; l++) {
            let i = this.layerOrder[l];
            let g = document.createElementNS(svgns, "g");
            g.id =  `g_l${i}`;
            let rect = document.createElementNS(svgns, "rect");
            //rect.onmousedown = startDragColumn;
            rect.onclick = swapColumns;
            rect.id = `layer_${i}`
            rect.classList.add("layer")
            rect.classList.add("graph_el")
            rect.setAttribute("x", this.xSpace * l + (this.xSpace * (NODE_SIZE + NODE_SIZE/2)));
            rect.setAttribute("y", 0);
            rect.setAttribute("width", this.xSpace * NODE_SIZE);
            rect.setAttribute("height", this.ySpace * layers[i]);
            rect.setAttribute("fill", ColorMapper.getLayerColor(i, 64));
            
            g.appendChild(rect);
            this.layerGroups[i] = g;
        }
    }

    /**
     * Create the node objects for each layer of the graph
     * @param {Array} layers an array containing the size of each layer of the graph 
     */
    createNodes(layers) {
        this.layers = new Array(layers.length);
        for(let l = 0; l < layers.length; l++) {
            let i = this.layerOrder[l]
            let arr = [];
            for(let j = 0; j < layers[i]; j++) {
                let node = new Node((.5 * this.xSpace) + l * this.xSpace, 
                                    this.ySpace * j + .5 * this.ySpace, 
                                    this.ySpace * .25, i, j);
                //node.draw(this.container);
                arr.push(node);
            }
            this.layers[i] = arr;
        }
    }

    /**
     * Display previuously created nodes to the user
     * @param {Array} layers an array representing the size of each layer in the graph 
     */
    drawNodes(layers) {
        for(let l = 0; l < layers.length; l++) {
            for(let j = 0; j < layers[l]; j++) {
                this.layers[l][j].draw(this.layerGroups[l]);
                this.container.appendChild(this.layerGroups[l])
            }
        } 
    }

    /**
     * Create and display the edges between each consecutive layer of the graph
     * @param {Array} interfaces an array of EdgeInterface objects
     */
    drawEdges(interfaces) {
        //for each layer
        for(let l = 0; l < interfaces.length - 1; l++) {
            let ind1 = this.layerOrder[l]; // get the index of the first layer
            let ind2 = this.layerOrder[l+1]; // get the index of the second layer
            let edges = interfaces[ind1][ind2].e; // get the set of edges that connect them


            for(let i = 0; i < edges.length; i++) {
                for(let j = 0; j < edges[i].length; j++) {
                    if(edges[i][j].w > 0) { // if the edge exists

                        // create the new edge object
                        let node1 = this.layers[ind1][i];
                        let node2 = this.layers[ind2][j];
                        let e = new Edge(node1, node2, edges[i][j].w, edges[i][j].inClique, this.container);
                        
                        // Call show to ensure that the svg for edge is created.
                        e.show();


                        if(!(("l" + ind1 + "n" + i) in this.edges)) {
                            this.edges["l" + ind1 + "n" + i] = [];
                            this.edges["l" + ind1 + "n" + i].push(e);
                        }
                        else
                            this.edges["l" + ind1 + "n" + i].push(e)

                        if(!(("l" + ind2 + "n" + j) in this.edges)) {
                            this.edges["l" + ind2 + "n" + j] = [];
                            this.edges["l" + ind2 + "n" + j].push(e)
                        }
                        else 
                            this.edges["l" + ind2 + "n" + j].push(e)


                
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

        // DrawnFlags will be used to determine which layers headers still need to be drawn
        let drawnFlags = new Array(layers.length);
        for(let l = 0; l < layers.length; l++) {
            let i = this.layerOrder[l];
            drawnFlags[i] = 1;
        }
        
        // Clear the table
        while(this.tableG.firstChild) {
            this.tableG.removeChild(this.tableG.lastChild);
        }

        // Make a group for the table
        this.tableSVG.appendChild(this.tableG);
        

        let org = {x: 0, y: 0};
        
        //For each set of adjacent layers
        for(let l = 0; l < layers.length - 1; l++) {
            let i = this.layerOrder[l];
            let j = this.layerOrder[l+1];
            this.drawTable(l, interfaces[i][j].e, org, drawnFlags);
            
            // Determine the next origin point
            let offset = {x:0, y:0};
            if(l%2) { // if the index is odd, move the origin vertically
                offset.y += (parseInt(layers[i]) + 1);
                if(l%4) // only every fourth layer will have a vertical header 
                    offset.x -= 1;
            }
            else { // if the index is even, move the origin horizontally
                offset.x += (parseInt(layers[i]) + 1);
                if(l > 0) // for all layers other than zero, offset header row
                    offset.y -= 1;
            }
            org.x += CELL_W * offset.x;
            org.y += CELL_H * offset.y;
            drawnFlags[i] = 0;
            drawnFlags[j] = 0;
        }

        // Determine the width of the table
        let table_width = parseInt(layers[this.layerOrder[0]]) + 1;
        if(layers.length >= 3 && layers.length != 5) {
            table_width += parseInt(layers[this.layerOrder[2]]) + 1;
        }
        else if(layers.length == 5) {
            table_width = Math.max(parseInt(layers[this.layerOrder[0]]) + parseInt(layers[this.layerOrder[2]]) + 2,
                                  ((parseInt(layers[this.layerOrder[0]]) + 1) - 
                                  (parseInt(layers[this.layerOrder[1]]) + 1)) + 
                                  parseInt(layers[this.layerOrder[2]]) + parseInt(layers[this.layerOrder[4]]) + 2);
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
    drawTable(layer_ind, edges, org, drawnFlags) {
        let l1ind, l2ind, color1, color2;

        // for every other layer, the layer on the top vs. on the side needs to be swapped
        if(layer_ind%2) {
            l1ind = this.layerOrder[layer_ind + 1];
            l2ind = this.layerOrder[layer_ind];
            color1 = ColorMapper.getLayerColor(l1ind);
            color2 = ColorMapper.getLayerColor(l2ind);
        }
        else
        {
            l1ind = this.layerOrder[layer_ind];
            l2ind = this.layerOrder[layer_ind + 1];
            color1 = ColorMapper.getLayerColor(l1ind);
            color2 = ColorMapper.getLayerColor(l2ind);
            
        }
        
        let l = [this.layers[l1ind], this.layers[l2ind]];
        let c = [color1, color2]
        let id_ord = [this.layerOrder[layer_ind], this.layerOrder[layer_ind + 1]]
        let flags = [drawnFlags[l1ind], drawnFlags[l2ind]];

        // Create and color the indivudual boxes
        this.tables.push(new Table(l, edges, org, flags, c, layer_ind, l1ind, l2ind, id_ord, this.tableG))
    }

    /**
     *  create and show the Cliques present in the graph
     */
    drawCliques(interfaces, layers) {
        this.cliques = new Array(this.layers.length - 1);
        
        //For each set of adjacent layers
        for(let l = 0; l < this.layers.length - 1; l++) {
            let i = this.layerOrder[l];
            let j = this.layerOrder[l+1];
            let arr = new Array(interfaces[i][j].num_cliques);

            // For each clique between these two layers
            for(let c = 0; c < interfaces[i][j].num_cliques; c++) {
                let clique = interfaces[i][j].cliques[c];
                let leftNodes = [];
                let rightNodes = [];
                let edges = {};

                // Get all the nodes on the left side of the clique
                for(let n = 0; n < clique[0].length; n++) {
                    let tempArr = [];
                    let node = this.layers[i][clique[0][n]];
                    this.edges[node.id].forEach(edge => {
                        if(edge.cliques.includes(c) && edge.leftNode == node)
                            tempArr.push(edge);
                    })
                    leftNodes.push(node);
                    edges[node.id] = tempArr;
                }

                // Get all the nodes on the right side of the clique
                for(let n = 0; n < clique[1].length; n++) {
                    let tempArr = [];
                    let node = this.layers[j][clique[1][n]];
                    this.edges[node.id].forEach(edge => {
                        if(edge.cliques.includes(c) && edge.rightNode == node)
                            tempArr.push(edge);
                    })
                    rightNodes.push(node);
                    edges[node.id] = tempArr;
                }
                arr[c] = new Clique(leftNodes, rightNodes, i, c, edges)
            }

            // Sort array of cliques by ideal vertical position
            arr.sort(function(a, b) {
                return a.idealCenter.y - b.idealCenter.y;
            })

            // Equally divide available space by number of cliques
            let height = ((layers[i] > layers[j]) ? layers[i] : layers[j]) * this.ySpace;
            let cliqueSpace  = height / interfaces[i][j].num_cliques;
            
            // Set the vertical position of the clique, and decide if it should be shown or hidden
            for(let c = 0; c < arr.length; c++) {
                arr[c].setCenter((cliqueSpace * c) + (cliqueSpace / 2), this.container);
                arr[c].setID(c);
                if(this.cliqueView && (this.showAllCliques || arr[c].good))
                    arr[c].show();
                else
                    arr[c].hide();
            }
            this.cliques[i] = arr;
        }
     }

    getNode(id) {
        let nums = idToIndex(id);
        return this.layers[nums.l][nums.n];
    }

    selectNode(id, type, clique) {
        let node = this.getNode(id);
        node.select();
        let edges = this.edges[id];
        if(!edges)
            return;

        let cliqueList = this.cliques[node.layer]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.highlightNode(node.id, type);
                }
            })
        cliqueList = this.cliques[this.layerOrder[this.layerOrder.indexOf(node.layer) - 1]]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node)) {
                    c.highlightNode(node.id, type);
                }
            })

        edges.forEach(edge => {
            if(clique == null || edge.cliques.includes(clique)) {
                edge.highlight(type)
                this.getNode(edge.getOtherID(id)).select();
            }
            
        });
    }

    recursiveSelect(id, type, propagation) {
        let node = this.getNode(id);
        node.select();
        let edges = this.edges[id];
        if(!edges)
            return;

        let cliqueList = this.cliques[node.layer]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.leftNodes.includes(node) && (propagation == undefined || propagation == "right")) {
                    c.highlightNode(node.id, type);
                }
            })
        cliqueList = this.cliques[this.layerOrder[this.layerOrder.indexOf(node.layer) - 1]]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node) && (propagation == undefined || propagation == "left")) {
                    c.highlightNode(node.id, type);
                }
            })
        
        edges.forEach(edge => {
            if(propagation == undefined) {
                if (node == edge.leftNode)
                    this.recursiveSelect(edge.rightNode.id, type, "right", edge.weight)
        
                if (node == edge.rightNode)
                    this.recursiveSelect(edge.leftNode.id, type, "left", edge.weight)
                edge.highlight(type);
                this.getNode(edge.getOtherID(id)).select();
            }
            else if (propagation == "right") {
                if (node == edge.leftNode) {
                    this.recursiveSelect(edge.rightNode.id, type, "right")
                    edge.highlight(type);
                    this.getNode(edge.getOtherID(id)).select();
                }
            }
            else if (propagation == "left") {
                if(node == edge.rightNode) {
                    this.recursiveSelect(edge.leftNode.id, type, "left")    
                    edge.highlight(type);
                    this.getNode(edge.getOtherID(id)).select(); 
                }
            }
        })
    }

    recursiveDeselect(id, type, propagation) {
        let node = this.getNode(id);
        node.deselect();
        let edges = this.edges[id];
        if(!edges)
            return;

        let cliqueList = this.cliques[node.layer]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.deselect();
                }
            })

        cliqueList = this.cliques[this.layerOrder[this.layerOrder.indexOf(node.layer) - 1]]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node)) {
                    c.deselect();
                }
            })

        edges.forEach(edge => {
            if(propagation == undefined) {
                if (node == edge.leftNode)
                    this.recursiveDeselect(edge.rightNode.id, type, "right")
        
                if (node == edge.rightNode)
                    this.recursiveDeselect(edge.leftNode.id, type, "left")
                edge.reset();
                this.getNode(edge.getOtherID(id)).deselect();
            }
            else if (propagation == "right") {
                if (node == edge.leftNode) {
                    this.recursiveDeselect(edge.rightNode.id, type, "right")
                    edge.reset();
                    this.getNode(edge.getOtherID(id)).deselect();
                }
            }
            else if (propagation == "left") {
                if(node == edge.rightNode) {
                    this.recursiveDeselect(edge.leftNode.id, type, "left")    
                    edge.reset();
                    this.getNode(edge.getOtherID(id)).deselect(); 
                }
            }
        })
    }

    deselectNode(id) {
        let node = this.getNode(id);
        node.deselect();
        let edges = this.edges[id];
        if(edges)
            edges.forEach(edge => {
                edge.reset();
                this.getNode(edge.getOtherID(id)).deselect();
            });
        
        let cliqueList = this.cliques[node.layer]    
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.deselect();
                }
            })
        
        cliqueList = this.cliques[this.layerOrder[this.layerOrder.indexOf(node.layer) - 1]]    
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node)) {
                    c.deselect();
                }
            })
    }

    selectClique(id, type) {
        const inds = idToIndex(id);
        let clique = this.cliques[inds.l][inds.n];
        clique.select(type);
        clique.leftNodes.forEach(node => {
            node.select();
        })
        clique.rightNodes.forEach(node => {
            node.select();
        })

        // Mark each edge in the clique on the table
        clique.leftNodes.forEach(lNode => {
            clique.rightNodes.forEach(rNode => {
                this.edges[lNode.id].forEach(e => {
                    if(this.edges[rNode.id].includes(e)) {
                        e.highlight(type);
                    }
                })
            })
        })
    }

    deselectClique(id) {
        const inds = idToIndex(id);
        let clique = this.cliques[inds.l][inds.n];
        clique.deselect();
        clique.leftNodes.forEach(node => {
            node.deselect();
        })
        clique.rightNodes.forEach(node => {
            node.deselect();
        })

        clique.leftNodes.forEach(lNode => {
            clique.rightNodes.forEach(rNode => {
                this.edges[lNode.id].forEach(e => {
                    if(this.edges[rNode.id].includes(e)) {
                        e.reset();
                    }
                })
            })
        })

    }

    toggleView() {
        let toggle = document.getElementById("clique_toggle")
        if(this.cliqueView) {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    clique.hide();
                })
            })

            this.cliqueView = false;
            toggle.innerHTML = "Show Cliques";
        }
        else {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    if(this.showAllCliques || clique.good)
                        clique.show();
                })
            })

            this.cliqueView = true;
            toggle.innerHTML = "Hide Cliques";
        }
    }

    toggleGood() {    
        let toggle = document.getElementById("good_toggle");

        if(this.showAllCliques) {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    if(!clique.good && this.cliqueView)
                        clique.hide();
                })
            })

            this.showAllCliques = false;
            toggle.innerHTML = "Show All Cliques";
        }
        else {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    if(!clique.good && this.cliqueView)
                        clique.show();
                })
            })

            this.showAllCliques = true;
            toggle.innerHTML = "Show Only Good Cliques";
        }
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
        let viewBox;
        let target;
        if(path.includes(this.tableSVG)) {
            viewBox = this.vbTable;
            target = this.tableSVG;
        }
        if(path.includes(this.container)) {
            viewBox = this.vbGraph;
            target = this.container;
        }

        let oldWidth = viewBox.width;
        let oldHeight = viewBox.height;
        if(viewBox.height + dY * ZOOM_AMT > 0)
            viewBox.height += dY * ZOOM_AMT;
        
        if(viewBox.width + dY * ZOOM_AMT > 0)    
            viewBox.width += dY * ZOOM_AMT;
        
        viewBox.min_x += (oldWidth - viewBox.width)/2
        viewBox.min_y += (oldHeight - viewBox.height)/2
        this.setViewBox(target, viewBox)
    }
    
    startPan(x, y, target) {
        target.onmousemove = pan;
        target.onmouseup = endPan;
        this.panPos = {"x": x, "y": y};
    }

    pan(x, y, path) {

        let viewBox, target;
        if(path.includes(this.tableSVG)) {
            viewBox = this.vbTable;
            target = this.tableSVG;
        }
        if(path.includes(this.container)) {
            viewBox = this.vbGraph;
            target = this.container;
        }
        // Get amount mouse has moved
        let offset = {"x": this.panPos.x - x, "y": this.panPos.y - y}
        // Update the object member
        viewBox.min_x += offset.x;
        viewBox.min_y += offset.y;

        // update the element
        this.setViewBox(target, viewBox)
        
        // Reset pan
        this.panPos =  {"x": x, "y": y};
    }

    endPan(path) {
        this.tableSVG.onmousemove = null;
        this.tableSVG.onmouseup = null;

        this.container.onmousemove = null;
        this.container.onmouseup = null;
    }

    setViewBox(ele, vb) {
        ele.setAttribute("viewBox", `${vb.min_x} ${vb.min_y} ${vb.width} ${vb.height}`)
    }
}
