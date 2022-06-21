/**
 * A collection of nodes and edges which form a densely connected sub-graph
 */
class Clique {
    constructor(left, right, layer, num, edges) {
        this.layer = layer;
        this.num = num;
        
        this.id = 'UNSET';
        
        this.showing = true;

        this.leftNodes = left;
        this.rightNodes = right;
        
        this.idealCenter = null;
        this.finalCenter = null;
        
        this.svg = null;
        
        this.leftPaths = {};
        this.rightPaths = {};
        this.edges = edges;

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
        
        this.svg = document.createElementNS(svgns, "rect");
        this.svg.classList.add("graph_el");
        this.svg.setAttribute("x", this.finalCenter.x - (CLIQUE_W / 2))
        this.svg.setAttribute("y", this.finalCenter.y - (CLIQUE_H / 2))
        this.svg.setAttribute("width", CLIQUE_W);
        this.svg.setAttribute("height", CLIQUE_H);
        this.svg.setAttribute("rx", CLIQUE_R);
        this.svg.setAttribute("ry", CLIQUE_R);
        this.svg.setAttribute("fill", "#7b9ead")
        this.svg.setAttribute("stroke", "black")
        this.svg.setAttribute("id", this.id);
        this.svg.setAttribute("onmouseover", "selectClique(this.id)")
        this.svg.setAttribute("onmouseout", "deselectClique(this.id)")
        
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
            cont.appendChild(path)
        })
        cont.appendChild(this.svg);
    }

    highlightNode(node) {
        if(!(node in this.leftPaths) && !(node in this.rightPaths))
            return false; 

        let avWeight = 0;
        let nodeOnLeft = node in this.leftPaths;
        this.edges[node].forEach(edge => {
            let w = edge.weight;
            avWeight += w;

            if(nodeOnLeft) {
                this.rightPaths[edge.getOtherID(node)].setAttribute("stroke", edge.getColMap())
            }
            else {
                this.leftPaths[edge.getOtherID(node)].setAttribute("stroke", edge.getColMap())
            }
        })
        avWeight /= this.edges[node].length;
        let col =  `rgba(${avWeight < .5 ? 255 : 255 - 255 * 2 * (avWeight - .5)}, 
                    ${avWeight >= .5 ? 255 : 255 * 2 * (avWeight)}, 0, 1)`;
        if(nodeOnLeft)
            this.leftPaths[node].setAttribute("stroke", col);
        else
            this.rightPaths[node].setAttribute("stroke", col)

    }

    /**
     * Highlight this clique visually
     */
    select() {

        if(DEBUG)
            this.log();

        
        this.svg.setAttribute("fill", "red")
        for(let id in this.leftPaths) {
            let weight = 0;
            this.edges[id].forEach(edge => {
                weight += edge.weight;
            })
            weight /= this.rightNodes.length;
            let col =  ColorMapper.getColor(weight);
            this.leftPaths[id].setAttribute("stroke", col)
        }

        for(let id in this.rightPaths) {
            let weight = 0;
            this.edges[id].forEach(edge => {
                weight += edge.weight;
            })
            weight /= this.leftNodes.length;
            let col =  ColorMapper.getColor(weight);
            this.rightPaths[id].setAttribute("stroke", col)
        }
    }

    /**
     * Reset this clique from the state of being Highlighted
     */
    deselect() {
        this.svg.setAttribute("fill", "#7b9ead")
        for(let id in this.leftPaths) {
            this.leftPaths[id].setAttribute("stroke", "#000000")
        }
        for(let id in this.rightPaths) {
            this.rightPaths[id].setAttribute("stroke", "#000000")
        }
    }

    hide() {
        this.svg.setAttribute("opacity", "0");
        this.svg.removeAttribute("onmouseover")
        this.svg.removeAttribute("onmouseout")
        this.leftNodes.forEach(node => {
            this.leftPaths[node.id].setAttribute("opacity", "0")
        })

        this.rightNodes.forEach(node => {
            this.rightPaths[node.id].setAttribute("opacity", "0")
        })
        this.showing = false;
    }

    show() {
        this.svg.setAttribute("opacity", "1");
        this.svg.setAttribute("onmouseover", "selectClique(this.id)")
        this.svg.setAttribute("onmouseout", "deselectClique(this.id)")
        this.leftNodes.forEach(node => {
            this.leftPaths[node.id].setAttribute("opacity", "1")
        })

        this.rightNodes.forEach(node => {
            this.rightPaths[node.id].setAttribute("opacity", "1")
        })
        this.showing = true;
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