

/**
 * Represtntative of a single node in a graph
 */
 class Node {
    constructor(x, y, r, layer, number) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.edges = null;
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
        this.svg.classList.add("graph_el");
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

    /**
     * Highlight this node visually
     */
    select() {
        this.svg.setAttribute("fill", LAYER_COLS[this.layer]);
        let tab = document.getElementById(this.id + "_tab");
        tab.setAttribute("fill", LAYER_COLS[this.layer]);
        tab.setAttribute("stroke", "black");
    }

    /**
     * Reset the node after being highlighted
     */
    deselect() {
        this.svg.setAttribute("fill", NODE_COL)
        let tab = document.getElementById(this.id + "_tab");
        tab.setAttribute("fill", LAYER_COLS[this.layer] + "7F");
        tab.setAttribute("stroke", LAYER_COLS[this.layer]);
    }


}

