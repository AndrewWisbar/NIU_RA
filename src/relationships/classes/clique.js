/**
 * A collection of nodes and edges which form a densely connected sub-graph
 */
class Clique {
    constructor(left, right, layer, num) {
        this.leftNodes = left;
        this.rightNodes = right;
        this.idealCenter = null;
        this.svg = null;
        this.finalCenter = null;
        this.layer = layer;
        this.num = num;
        this.id = 'UNSET';
        this.edges = {};

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
            path.setAttribute("stroke", "black")
            path.setAttribute("d", new_path);
            this.edges[node.id] = path;
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
            this.edges[node.id] = path;
            cont.appendChild(path)
        })
        cont.appendChild(this.svg)

    }

    /**
     * Highlight this clique 
     */
    select() {
        this.svg.setAttribute("fill", "red")

    }

    /**
     * Reset this clique from the state of being Highlighted
     */
    deselect() {
        this.svg.setAttribute("fill", "#7b9ead")
    }
}