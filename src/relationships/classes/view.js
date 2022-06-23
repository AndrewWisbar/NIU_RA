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
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
        this.cliques = []; // hold all the cliques in the graph

        this.cliqueView = true;
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
        this.layerGroups = new Array(layers.length);
        for(let i = 0; i < layers.length; i++) {
            let g = document.createElementNS(svgns, "g");
            g.setAttribute("id", `g_l${i}`)
            let rect = document.createElementNS(svgns, "rect");
            rect.onmousedown = startDragColumn;
            rect.id = `layer_${i}`
            rect.classList.add("layer")
            rect.setAttribute("x", this.xSpace * i + (this.xSpace * (NODE_SIZE + NODE_SIZE/2)));
            rect.setAttribute("y", 0);
            rect.setAttribute("width", this.xSpace * NODE_SIZE);
            rect.setAttribute("height", this.ySpace * layers[i]);
            rect.setAttribute("fill", LAYER_COLS[i]);
            rect.setAttribute("opacity", 0.25)
            
            g.appendChild(rect);
            this.layerGroups[i] = g;
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
                this.layers[i][j].draw(this.layerGroups[i]);
                this.container.appendChild(this.layerGroups[i])
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
                        let node1 = this.layers[l][i];
                        let node2 = this.layers[l+1][j];


                        let e = new Edge(node1, node2, edges[i][j].w, edges[i][j].inClique, this.container);
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
        let drawnFlags = new Array(layers.length);
        for(let i = 0; i < layers.length; i++)
            drawnFlags[i] = 1;
        while(this.tableG.firstChild) {
            this.tableG.removeChild(this.tableG.lastChild);
        }
        this.tableSVG.appendChild(this.tableG);
        let org = {x: 0, y: 0};

        for(let i = 0; i < layers.length - 1; i++) {
            this.drawTable(layers, i, interfaces[i].e, org, drawnFlags);
            let offset = {x:0, y:0};

            if(i%2) {
                offset.y += (parseInt(layers[i]) + 1);
                if(i%4)
                    offset.x -= 1;
            }
            else {
                offset.x += (parseInt(layers[i]) + 1);
                if(i%3)
                    offset.y -= 1;
            }
            
            org.x += CELL_W * offset.x;
            org.y += CELL_H * offset.y;
            drawnFlags[i] = 0;
            drawnFlags[i + 1] = 0;
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
    drawTable(layers, layer_ind, edges, org, drawnFlags) {
        let layer1, l1ind, l2ind, layer2, color1, color2;
        
        // for every other layer, the layer on the top vs. on the side needs to be swapped
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

        let l = [this.layers[l1ind], this.layers[l2ind]];
        
        let flags = [0, 0];
        if(drawnFlags[l1ind])
            flags[0] = 1;
        if(drawnFlags[l2ind])
            flags[1] = 1;
        // Create and color the indivudual boxes
        this.tables.push(new Table(l, edges, org, flags, [color1, color2], l1ind, this.tableG, layer_ind%2))
    }

    /**\
     * 
     */
    drawCliques(interfaces, layers) {
        for(let i = 0; i < interfaces.length; i++) {
            let arr = new Array(interfaces[i].num_cliques);
            for(let c = 0; c < interfaces[i].num_cliques; c++) {
                let clique = interfaces[i].cliques[c];
                let leftNodes = [];
                let rightNodes = [];
                let edges = {};
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

                for(let n = 0; n < clique[1].length; n++) {
                    let tempArr = [];
                    let node = this.layers[i+1][clique[1][n]];
                    this.edges[node.id].forEach(edge => {
                        if(edge.cliques.includes(c) && edge.rightNode == node)
                            tempArr.push(edge);
                    })
                    rightNodes.push(node);
                    edges[node.id] = tempArr;
                }
                arr[c] = new Clique(leftNodes, rightNodes, i, c, edges)
            }
            // Sort array of cliques by ideal height
            arr.sort(function(a, b) {
                return a.idealCenter.y - b.idealCenter.y;
            })
            let height = ((layers[i] > layers[i+1]) ? layers[i] : layers[i + 1]) * this.ySpace;
            let cliqueSpace  = height / interfaces[i].num_cliques;
            
            for(let c = 0; c < arr.length; c++) {
                arr[c].setCenter((cliqueSpace * c) + (cliqueSpace / 2), this.container);
                arr[c].setID(c);
            }

            this.cliques.push(arr)
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
        if(node.layer < this.cliques.length)
            this.cliques[node.layer].forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.highlightNode(node.id, type);
                }
            })
        if(node.layer - 1 >= 0)
            this.cliques[node.layer - 1].forEach(c => {
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

        if(node.layer < this.cliques.length)
            this.cliques[node.layer].forEach(c => {
                if(c.leftNodes.includes(node) && (propagation == undefined || propagation == "right")) {
                    c.highlightNode(node.id, type);
                }
            })
        if(node.layer - 1 >= 0)
            this.cliques[node.layer - 1].forEach(c => {
                if(c.rightNodes.includes(node) && (propagation == undefined || propagation == "left")) {
                    c.highlightNode(node.id, type);
                }
            })
        
        edges.forEach(edge => {
            if(propagation == undefined) {
                if (node == edge.leftNode)
                    this.recursiveSelect(edge.rightNode.id, type, "right")
        
                if (node == edge.rightNode)
                    this.recursiveSelect(edge.leftNode.id, type, "left")
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

        if(node.layer < this.cliques.length)
            this.cliques[node.layer].forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.deselect();
                }
            })
        if(node.layer - 1 >= 0)
            this.cliques[node.layer - 1].forEach(c => {
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
        
        if(node.layer < this.cliques.length)
            this.cliques[node.layer].forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.deselect();
                }
            })
        if(node.layer - 1 >= 0)
            this.cliques[node.layer - 1].forEach(c => {
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
        if(this.cliqueView) {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    clique.hide();
                })
            })

            for(let key in this.edges) {
                this.edges[key].forEach(edge => {
                    edge.show();
                });
            }
            this.cliqueView = false;
        }
        else {
            this.cliques.forEach(cliqueSet => {
                cliqueSet.forEach(clique => {
                    clique.show();
                })
            })

            for(let key in this.edges) {
                this.edges[key].forEach(edge => {
                    if(edge.cliques.length != 0)
                        edge.hide();
                })
                
            }
            this.cliqueView = true;
        }
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
