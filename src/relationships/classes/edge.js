/**
 * A connection between two nodes in the graph
 */
class Edge {
    constructor(node1, node2, weight, cliques, container) {
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
        this.draw(container);
    }

    /**
     * Display the edge to the user
     * @param {HTMLElement} cont the SVG element the edge will be a child of 
     */
    draw(cont) {
        this.svg = document.createElementNS(svgns, "line");
        if(this.cliques.length)
            this.svg.setAttribute("opacity", 0);

        cont.appendChild(this.svg);
        this.svg.setAttribute("x1", this.x1);
        this.svg.setAttribute("y1", this.y1);
        this.svg.setAttribute("x2", this.x2);
        this.svg.setAttribute("y2", this.y2);
        this.svg.setAttribute("id", this.id);
        this.setColor("black")
    }
    
    highlight(type) {
        switch(type) {
            default:
            case "def":
                this.setColMap();
                break;

            case "gry":
                this.setGreyScale();
                break;

            case "sze":
                this.setSize();
                break;

            case "dsh":
                this.setDash();
                break;
        }
        this.isHighlighted = true;
    }
    /**
     * Set the color of the SVG element to a specific color
     * @param {String} col a string representing a color incoding 
     */
    setColor(col) {
        this.svg.setAttribute("stroke", col);
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

    /**
     * Set the color of this edge in greyscale
     */
    setGreyScale() {
        let col = ColorMapper.getGreyScale(this.weight);
        this.svg.setAttribute("stroke-width", 5)
        this.setColor(col);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", col);
    }

    /**
     * Set the color of this edge for default highlighting
     */
    setColMap() {
        let col =  ColorMapper.getColor(this.weight);

        this.svg.setAttribute("stroke-width", 5);
        this.setColor(col);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", col);
    }

    /**
     * Set the size of this edge based on the weight
     */
    setSize() {
        this.svg.setAttribute("stroke-width", ColorMapper.getSize(this.weight))
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", this.getColMap());
    }

    /**
     * Set the dash array of this edge based on the weight
     */
    setDash() {
        this.svg.setAttribute("stroke-dasharray", ColorMapper.getDashArray(this.weight));
        this.svg.setAttribute("stroke-width", 5);
        let tab = document.getElementById(this.id + "_tab");
        if(tab)
            tab.setAttribute("fill", this.getColMap());
    }

    /**
     * Reset this edge after being highlighted
     */
    reset() {
        this.setColor("rgba(0,0,0,1)")
        this.svg.setAttribute("stroke-width", 1);
        this.svg.removeAttribute("stroke-dasharray")
        let tab = document.getElementById(this.id + "_tab");
        this.isHighlighted = false;
        if(tab)
            tab.setAttribute("fill", NODE_COL);
    }

    show() {
        this.svg.setAttribute("opacity", "100")
    }

    hide() {
        this.svg.setAttribute("opacity", "0")
    }
}