/**
 * A connection between two nodes in the graph
 */
class Edge {
    constructor(node1, node2, weight, cliques) {
        this.leftNode = node1;
        this.rightNode = node2;
        this.id = this.leftNode.id + this.rightNode.id;
        this.cliques = cliques;
        this.isHighlighted = false;
        this.x1 = node1.x;
        this.y1 = node1.y;
        this.x2 = node2.x;
        this.y2 = node2.y;
        this.weight = weight;

        this.showing = false;

        this.leftNode.selectDelegate.subscribe({fn: this.highlight, scope: this})
        this.rightNode.selectDelegate.subscribe({fn: this.highlight, scope: this})

        this.leftNode.deselectDelegate.subscribe({fn: this.reset, scope: this})
        this.rightNode.deselectDelegate.subscribe({fn: this.reset, scope: this})
    }

    /**
     * Create the svg element for this element
     * @param {HTMLElement} cont the SVG element the edge will be a child of 
     */
    draw(cont) {
        this.svg = document.createElementNS(svgns, "line");

        this.svg.classList.add("hide");

        cont.appendChild(this.svg);
        this.svg.setAttribute("x1", this.x1);
        this.svg.setAttribute("y1", this.y1);
        this.svg.setAttribute("x2", this.x2);
        this.svg.setAttribute("y2", this.y2);
        this.svg.setAttribute("id", this.id);
        this.svg.classList.add("edge");
        this.svg.classList.add("graph_el");
        this.setColor("black")
    }
    
    /**
     * Highlight this edge
     */
    highlight() {
        this.leftNode.highlight();
        this.rightNode.highlight();
        ColorMapper.highlight(this.svg, this.weight);
        this.highlightTable(ColorMapper.getHighlightColor(this.weight));
        this.isHighlighted = true;
    }


    /**
     * Get the weight of this edge
     * @returns the weight of this edge
     */
    getWeight() {
        return this.weight;
    }

    /**
     * Given the ID of one of the nodes this edge connects, return the other
     * @param {String} id id of one of the nodes connected by this edge 
     * @returns the ID of the other node or false
     */
    getOtherID(id) {
        if(id != this.leftNode.id && id != this.rightNode.id)
            return false;
        
        return (id == this.leftNode.id) ? this.rightNode.id : this.leftNode.id;
    }

        /**
     * Given the ID of one of the nodes this edge connects, return the other
     * @param {String} id id of one of the nodes connected by this edge 
     * @returns the other node or false
     */
    getOtherNode(id) {
        if(id != this.leftNode.id && id != this.rightNode.id)
            return false;
        
        return (id == this.leftNode.id) ? this.rightNode : this.leftNode;
    }

    /**
     * Get the color encoding for Greyscale highlighting
     * @returns a string representing a color encoding
     */
    getGreyScale() {
        return  ColorMapper.getGreyScale(this.weight);
    }

    /**
     * Get the color encoding for Default highlighting
     * @returns a string representing a color encoding
     */
    getColMap() {
        return ColorMapper.getColor(this.weight);
    }

    highlightTable(col) {
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", col);
    }

    /**
     * Reset this edge after being highlighted
     */
    reset() {
        this.leftNode.reset();
        this.rightNode.reset();
        this.setColor("rgba(0,0,0,1)")
        this.svg.setAttribute("stroke-width", 1);
        this.svg.removeAttribute("stroke-dasharray")
        let tab = document.getElementById(this.id + "_tab");
        this.isHighlighted = false;
        if(tab)
            tab.setAttribute("fill", NODE_COL);
    }

    /**
     * Display the svg for this edge
     */
    show() {
        this.svg.classList.remove("hide")
        this.showing = true;
    }

    /**
     * Hide the svg for this edge
     */
    hide() {
        this.svg.classList.add("hide")
        this.showing = false;
    }

    /**
     * The the color of this edge
     * @param {String} color color string to set the edge to
     */
    setColor(color) {
        this.svg.setAttribute("stroke", color)
    }
}