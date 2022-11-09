/**
 * Represents an edge that is not in the graph
 */
class MissingEdge extends Edge {
    constructor(node1, node2) {
        super(node1, node2, 0, []);

        this.showing = false;
    }

    draw(cont) {
        this.svg = document.createElementNS(svgns, "line");


        cont.appendChild(this.svg);
        this.svg.setAttribute("x1", this.x1);
        this.svg.setAttribute("y1", this.y1);
        this.svg.setAttribute("x2", this.x2);
        this.svg.setAttribute("y2", this.y2);
        this.svg.setAttribute("id", this.id);
        this.svg.setAttribute("stroke-width", 3)
        this.svg.classList.add("anti_edge");
        this.svg.classList.add("graph_el");
        this.svg.classList.add("hide");
        this.setColor("grey")
    }

    //For now, we simply stub in these functions to overwrite the behavior
    //inherited from edge. If in the future we need to write behavior
    //specifically for anti-edges, we can simply write it here
    highlight() {}
    reset() {}
}