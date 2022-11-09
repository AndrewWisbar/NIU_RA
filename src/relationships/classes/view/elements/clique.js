/**
 * A collection of nodes and edges which form a densely connected sub-graph
 */
class Clique {
    constructor(left, right, layer, num, edges) {
        this.layer = layer; // which layer is this clique in (generally the id of the left hand layer)
        this.num = num; // the id of this clique
        this.id = 'UNSET'; 
        
        this.showing = true; // is this clique currently showing

        this.leftNodes = left; // set of nodes on the left side of the clique
        this.rightNodes = right; // set of nodes on the right
        
        this.idealCenter = null;
        this.finalCenter = null;
        
        this.svg = null;
        this.ghost = null; // "Ghost" svg used to represent dragging.
        
        this.leftPaths = {};
        this.rightPaths = {};
        this.edges = edges;

        let leftSum = 0, rightSum = 0;

        // assign highlighting methods to each nodes delegate
        this.leftNodes.forEach(node =>{
            leftSum += node.y;
            node.selectDelegate.subscribe({fn: this.highlightNode, scope:this})
            node.deselectDelegate.subscribe({fn: this.deselect, scope: this})
        });

        this.rightNodes.forEach(node =>{
            rightSum += node.y;
            node.selectDelegate.subscribe({fn: this.highlightNode, scope:this})
            node.deselectDelegate.subscribe({fn: this.deselect, scope: this})
        });

        let leftAvg = leftSum / this.leftNodes.length;
        let rightAvg = rightSum / this.rightNodes.length;

        this.idealCenter = {"x": (this.leftNodes[0].x + this.rightNodes[0].x) / 2, 
                            "y": (leftAvg + rightAvg) / 2};


        // Does this clique cause us to draw more or less edges?
        this.good = (this.leftNodes.length + this.rightNodes.length <= this.leftNodes.length * this.rightNodes.length)



        if(DEBUG) {
            this.log();
        }
    }

    /**
     * Set the center of the SVG for display
     * @param {Number} yPos the y position on the screen 
     * @param {HTMLElement} cont the parent of the new SVG
     */
    setCenter(yPos, cont) {
        this.finalCenter = {x: this.idealCenter.x, y: yPos};
        this.draw(cont);
    }

    /**
     * Update the num, id, and SVG for this clique
     * @param {Number} num the new index for this clique 
     */
    setID(num) {
        this.num = num;
        this.id = `l${this.layer}c${this.num}`;
        this.svg.setAttribute("id", this.id);
    }

    /**
     * Display the clique and its connections to the user
     * @param {HTMLElement} cont the container element that holds this clique 
     */
    draw(cont) {
        var self = this;
        this.svg = document.createElementNS(svgns, "rect");
        this.svg.classList.add("graph_el");
        this.svg.setAttribute("x", this.finalCenter.x - (CLIQUE_W / 2))
        this.svg.setAttribute("y", this.finalCenter.y - (CLIQUE_H / 2))
        this.svg.setAttribute("width", CLIQUE_W);
        this.svg.setAttribute("height", CLIQUE_H);
        this.svg.setAttribute("rx", CLIQUE_R);
        this.svg.setAttribute("ry", CLIQUE_R);
        this.svg.setAttribute("fill", ColorMapper.cliqueColor);
        this.svg.setAttribute("stroke", "black")
        this.svg.setAttribute("id", this.id);
        this.svg.onmouseover = function() {self.select()} 
        this.svg.onmouseout = function() {self.deselect()}
        this.svg.setAttribute("onmousedown", "dragCliqueStart(this.id, event)");
        this.svg.classList.add("clique")
        this.svg.classList.add("graph_el");
        
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
            path.setAttribute("stroke", "black");
            path.setAttribute("stroke-width", `${(this.rightNodes.length - 1) * 
                                                 (this.rightNodes.length - 1) * 
                                                 0.07 + 2}px`)
            path.setAttribute("d", new_path);
            path.classList.add("clique_path")
            path.classList.add("graph_el");
            this.leftPaths[node.id] = path;
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
            path.setAttribute("stroke-width", `${(this.leftNodes.length - 1) * 
                                                 (this.leftNodes.length - 1) * 
                                                 0.07 + 2}px`)
            this.rightPaths[node.id] = path;
            path.classList.add("clique_path")
            path.classList.add("graph_el");
            cont.appendChild(path)
        })
        
        cont.appendChild(this.svg);
    }

    /**
     * highlight this clique based on one of its nodes being selected
     * @param {Node} node the node that was selected
     */
    highlightNode(node) {
        // if node is not included in the clique simply return
        if(!this.leftNodes.includes(node) && !(this.rightNodes.includes(node)))
            return false; 

        let avWeight = 0;
        
        // which side is the node on?
        let nodeOnLeft = this.leftNodes.includes(node)
        
        // highlight each path in the clique
        this.edges[node.id].forEach(edge => {
            let w = edge.weight;
            avWeight += w;
            if(nodeOnLeft)
                this.highlightPath(this.rightPaths[edge.getOtherID(node.id)], w);
            else
                this.highlightPath(this.leftPaths[edge.getOtherID(node.id)], w);
        })

        // highlight the path connected to the selected node with the average weight of edges
        avWeight /= this.edges[node.id].length;
        if(nodeOnLeft)
            this.highlightPath(this.leftPaths[node.id], avWeight)
        else
            this.highlightPath(this.rightPaths[node.id], avWeight)

    }

    /**
     * Highlight this clique visually
     */
    select() {

        if(DEBUG)
            this.log();

        
        this.svg.setAttribute("fill", ColorMapper.cliqueSelectColor)
        for(let id in this.leftPaths) {
            let weight = 0;
            this.edges[id].forEach(edge => {
                weight += edge.weight;
                edge.highlight();
            })
            weight /= this.rightNodes.length;
            this.highlightPath(this.leftPaths[id], weight)
        }

        for(let id in this.rightPaths) {
            let weight = 0;
            this.edges[id].forEach(edge => {
                weight += edge.weight;
                edge.highlight();
            })
            weight /= this.leftNodes.length;
            this.highlightPath(this.rightPaths[id], weight)
        }

        for(let node of [...this.leftNodes, ...this.rightNodes]) {
            node.highlight();
        }
    }

    /**
     * Reset this clique from the state of being Highlighted
     */
    deselect() {
        this.svg.setAttribute("fill", "#7b9ead")
        for(let id in this.leftPaths) {
            this.edges[id].forEach(edge => {edge.reset()})
            this.resetPath(this.leftPaths[id])
        }
        for(let id in this.rightPaths) {
            this.edges[id].forEach(edge => {edge.reset()})
            this.resetPath(this.rightPaths[id])
        }

        for(let node of [...this.leftNodes, ...this.rightNodes]) {
            node.reset();
        }
    }

    /**
     * Stop showing this cliques svg elements
     */
    hide() {
        this.svg.classList.add("hide")
        this.leftNodes.forEach(node => {
            this.leftPaths[node.id].classList.add("hide")
        })

        this.rightNodes.forEach(node => {
            this.rightPaths[node.id].classList.add("hide")
        })

        this.showing = false;
    }

    /**
     * Show this cliques svg elements
     */
    show() {
        this.svg.classList.remove("hide")
        this.leftNodes.forEach(node => {
            this.leftPaths[node.id].classList.remove("hide")
        })

        this.rightNodes.forEach(node => {
            this.rightPaths[node.id].classList.remove("hide")   
        })

        this.showing = true;
    }

    highlightPath(path, weight) {
        ColorMapper.highlight(path, weight);
    }

    /**
     * Event handler for starting to drag the clique
     * @param {HTMLElement} container 
     */
    startDrag(container) {
        console.log("start")
        this.ghost = document.createElementNS(svgns, "rect");
        this.ghost.setAttribute("x", this.finalCenter.x - (CLIQUE_W / 2));
        this.ghost.setAttribute("y", this.finalCenter.y - (CLIQUE_H / 2));
        this.ghost.setAttribute("width", CLIQUE_W);
        this.ghost.setAttribute("height", CLIQUE_H);
        this.ghost.setAttribute("rx", CLIQUE_R);
        this.ghost.setAttribute("ry", CLIQUE_R);
        this.ghost.setAttribute("fill", ColorMapper.cliqueSelectColor);
        this.ghost.setAttribute("stroke", "black")
        this.ghost.setAttribute("opacity", "0.4")

        container.appendChild(this.ghost);
        container.setAttribute("onmouseover", `dragClique("${this.id}", event)`);
        container.setAttribute("onmouseup", `dragCliqueEnd("${this.id}", event)`);
        container.classList.add("no-cursor")
        container.classList.remove("panable");
    }

    drag(pos) {
        this.ghost.setAttribute("y", pos.y - CLIQUE_H / 2);
    }

    dragEnd(container) {
        this.ghost.remove();
        container.removeAttribute("onmouseover");
        container.removeAttribute("onmouseup");
        container.classList.remove("no-cursor")
        container.classList.add("panable");
        console.log(this.ghost)
    }

    getEdges() {
        return this.edges;
    }


    /**
     * Reset a path attached to this clique 
     * @param {Path} path the path to reset 
     */
    resetPath(path) {
        path.setAttribute("stroke", "#000000")
        path.removeAttribute("stroke-dasharray");

        if(Object.values(this.rightPaths).includes(path))
            path.setAttribute("stroke-width", `${(this.leftNodes.length - 1) * 
                                                            (this.leftNodes.length - 1) * 
                                                            0.07 + 2}px`)
        else
            path.setAttribute("stroke-width", `${(this.rightNodes.length - 1) * 
                                                            (this.rightNodes.length - 1) * 
                                                            0.07 + 2}px`)
    }

    log() {
        console.log('~~~~~~~~~~~~~~')
        console.log(`Clique id: ${this.id}`)
        console.log(`Attached Edges: `)
        console.log(this.edges)
        console.log(`Left Side Nodes: `)
        console.log(this.leftNodes)
        console.log(`Right Side Nodes: `)
        console.log(this.rightNodes);
    }
}