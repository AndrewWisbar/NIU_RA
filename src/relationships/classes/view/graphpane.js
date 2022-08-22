class GraphPane extends SVGPane {
    constructor(svg) {
        super(svg);

        this.contWidth = this.svg.clientWidth;
        this.contHeight = this.svg.clientHeight;

        this.xSpace = this.contWidth / 5;
        this.ySpace = this.contHeight / GROUP_MAX;

        this.layers = []; // Hold Layer objects that make up the graph
        this.layerOrder = []; // given a positional index returns layer in that position
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
        this.cliques = []; // hold all the cliques in the graph

        this.cliqueView = true;
        this.showAllCliques = true;
    }


    displayLoading() {
        let text = document.createElementNS(svgns, "text");
        text.innerHTML = "Loading ...";
        text.style.font = "bold 30px sans-serif";

        text.setAttribute("x", (this.svg.clientWidth / 2) - (text.clientWidth / 2))
        text.setAttribute("y", (this.svg.clientHeight / 2) - (text.clientHeight / 2))
        this.svg.appendChild(text);
    }

    render(layers, order, inter) {
        this.xSpace = this.contWidth / 5;
        this.ySpace = this.contHeight / GROUP_MAX;

        this.layers = []; // Hold Layer objects that make up the graph
        this.layerOrder = []; // given a positional index returns layer in that position
        this.edges = {}; // given a node id(lXnY) get an array of connected edges
        this.cliques = []; // hold all the cliques in the graph
        
        this.reset();
        this.drawLayerBackgrounds(layers, order);
        this.createNodes(layers, order);
        this.drawEdges(inter, order);
        this.drawCliques(inter, layers, order);
        this.drawNodes(layers);
    }

    

    /**
     * Draw transparent colored rectangles to help identify graph layers on the table
     * @param {Array} layers array of the size of each layer of nodes 
     */
     drawLayerBackgrounds(layers, order) {
        this.layers = new Array(layers.length);
        for(let l = 0; l < layers.length; l++) {
            let i = order[l];
            this.layers[l] = new Layer(this.xSpace * i + (this.xSpace * (NODE_SIZE + NODE_SIZE/2)), this.xSpace * NODE_SIZE, l, layers[l], this.ySpace, this.svg);
        }
    }

    /**
     * Create the node objects for each layer of the graph
     * @param {Array} layers an array containing the size of each layer of the graph 
     */
    createNodes(layers, order) {
        for(let l = 0; l < layers.length; l++) {
            let i = order[l]
            let arr = [];
            for(let j = 0; j < layers[i]; j++) {
                let node = new Node((.5 * this.xSpace) + l * this.xSpace, 
                                    this.ySpace * j + .5 * this.ySpace, 
                                    this.ySpace * .25, i, j);
                //node.draw(this.container);
                arr.push(node);
            }
            this.layers[i].setNodes(arr);
        }
    }

    /**
     * Display previuously created nodes to the user
     * @param {Array} layers an array representing the size of each layer in the graph 
     */
    drawNodes(layers) {
        for(let l = 0; l < layers.length; l++) {
            this.layers[l].draw(this.svg);
        } 
    }

    /**
     * Create and display the edges between each consecutive layer of the graph
     * @param {Array} interfaces an array of EdgeInterface objects
     */
     drawEdges(interfaces, order) {
        //for each layer
        for(let l = 0; l < interfaces.length - 1; l++) {
            let ind1 = order[l]; // get the index of the first layer
            let ind2 = order[l+1]; // get the index of the second layer
            let edges = interfaces[ind1][ind2].e; // get the set of edges that connect them


            for(let i = 0; i < edges.length; i++) {
                for(let j = 0; j < edges[i].length; j++) {
                    if(edges[i][j].w > 0) { // if the edge exists

                        // create the new edge object
                        let node1 = this.layers[ind1].getNode(i);
                        let node2 = this.layers[ind2].getNode(j);
                        let e = new Edge(node1, node2, edges[i][j].w, edges[i][j].inClique, this.svg);
                        
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
     *  create and show the Cliques present in the graph
     */
    drawCliques(interfaces, layers, order) {
        this.cliques = new Array(this.layers.length - 1);
        
        //For each set of adjacent layers
        for(let l = 0; l < this.layers.length - 1; l++) {
            let i = order[l];
            let j = order[l+1];
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
                    let node = this.layers[i].getNode(clique[0][n]);
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
                    let node = this.layers[j].getNode(clique[1][n]);
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
                arr[c].setCenter((cliqueSpace * c) + (cliqueSpace / 2), this.svg);
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
        return this.layers[nums.l].getNode(nums.n);
    }

    selectNode(id, type, clique, order) {
        let node = this.getNode(id);
        console.log(node);
        node.select();
        let edges = this.edges[id];
        console.log(edges);
        if(!edges)
            return;

        let cliqueList = this.cliques[node.layer]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.leftNodes.includes(node)) {
                    c.highlightNode(node.id, type);
                }
            })
        cliqueList = this.cliques[order[order.indexOf(node.layer) - 1]]
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

    deselectNode(id, order) {
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
        
        cliqueList = this.cliques[order[order.indexOf(node.layer) - 1]]    
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node)) {
                    c.deselect();
                }
            })
    }

    recursiveSelect(id, type, propagation, order) {
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
        cliqueList = this.cliques[order[order.indexOf(node.layer) - 1]]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node) && (propagation == undefined || propagation == "left")) {
                    c.highlightNode(node.id, type);
                }
            })
        
        edges.forEach(edge => {
            if(propagation == undefined) {
                if (node == edge.leftNode)
                    this.recursiveSelect(edge.rightNode.id, type, "right", order)
        
                if (node == edge.rightNode)
                    this.recursiveSelect(edge.leftNode.id, type, "left", order)
                edge.highlight(type);
                this.getNode(edge.getOtherID(id)).select();
            }
            else if (propagation == "right") {
                if (node == edge.leftNode) {
                    this.recursiveSelect(edge.rightNode.id, type, "right", order)
                    edge.highlight(type);
                    this.getNode(edge.getOtherID(id)).select();
                }
            }
            else if (propagation == "left") {
                if(node == edge.rightNode) {
                    this.recursiveSelect(edge.leftNode.id, type, "left", order)    
                    edge.highlight(type);
                    this.getNode(edge.getOtherID(id)).select(); 
                }
            }
        })
    }

    recursiveDeselect(id, type, propagation, order) {
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

        cliqueList = this.cliques[order[order.indexOf(node.layer) - 1]]
        if(cliqueList)
            cliqueList.forEach(c => {
                if(c.rightNodes.includes(node)) {
                    c.deselect();
                }
            })

        edges.forEach(edge => {
            if(propagation == undefined) {
                if (node == edge.leftNode)
                    this.recursiveDeselect(edge.rightNode.id, type, "right", order)
        
                if (node == edge.rightNode)
                    this.recursiveDeselect(edge.leftNode.id, type, "left", order)
                edge.reset();
                this.getNode(edge.getOtherID(id)).deselect();
            }
            else if (propagation == "right") {
                if (node == edge.leftNode) {
                    this.recursiveDeselect(edge.rightNode.id, type, "right", order)
                    edge.reset();
                    this.getNode(edge.getOtherID(id)).deselect();
                }
            }
            else if (propagation == "left") {
                if(node == edge.rightNode) {
                    this.recursiveDeselect(edge.leftNode.id, type, "left", order)    
                    edge.reset();
                    this.getNode(edge.getOtherID(id)).deselect(); 
                }
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


    getLayers() {
        return this.layers;
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
};