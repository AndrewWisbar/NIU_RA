

/**
 * Represtntative of a single node in a graph
 */
 class Node {
    constructor(x, y, r, layer, number) {
        this.x = x;
        this.y = y;
        this.svg = document.createElementNS(svgns, "circle");
        this.r = r;
        this.edges = null;

        this.layer = layer;
        this.number = number;
        this.id = "l" + layer + "n" + number;
        this.selectDelegate = new Delegate();
        this.deselectDelegate = new Delegate();
    }

    /**
     * Draw a representation of this node to show to the user
     * @param {HTMLElement} cont the SVG container the node is to be drawn in
     */
    draw(cont) {
        cont.appendChild(this.svg);
        this.svg.setAttribute("cx", this.x);
        this.svg.classList.add("graph_el");
        this.svg.setAttribute("cy", this.y);
        this.svg.setAttribute('r', this.r);
        this.svg.setAttribute('id', this.id);
        this.svg.setAttribute("fill", NODE_COL);
        this.svg.setAttribute("stroke", 'rgb(0, 0, 0)');

        let self = this;
        this.svg.onmouseover = function() {self.select()};
        this.svg.onmouseout = function() {self.deselect()};
        this.svg.classList.add("node");
        this.svg.classList.add("graph_el");
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
        this.selectDelegate.invoke(this);
        this.highlight();
    }

    /**
     * Reset the node after being highlighted
     */
    deselect() {
        this.deselectDelegate.invoke();
        this.reset();
    }

    /**
     * Visually highlight this node
     */
    highlight() {
        this.svg.setAttribute("fill", ColorMapper.getLayerColor(this.layer));
        let tab = document.getElementById(this.id + "_tab");
        if(tab) {
            tab.setAttribute("fill", ColorMapper.getLayerColor(this.layer));
            tab.setAttribute("stroke", "black");
        }
    }

    /**
     * Visually reset this node to default state
     */
    reset() {
        this.svg.setAttribute("fill", ColorMapper.nodeColor)
        let tab = document.getElementById(this.id + "_tab");
        if(tab) {
            tab.setAttribute("fill", ColorMapper.getLayerColor(this.layer, 127));
            tab.setAttribute("stroke", ColorMapper.getLayerColor(this.layer));
        }
    }

    /**
     * Get the svg circle element for this node
     */
    getSVG() {
        return this.svg;
    }

}

