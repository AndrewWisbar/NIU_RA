/**
 * A header representing a node in the tabular view of our data
 * 
 * This class is basically just a container object for select and deselect
 * delegates
 */
class TableHeader {
    constructor(svg, node) {
        this.svg = svg;
        this.mouseOverDelegate = new Delegate();
        this.mouseOutDelegate = new Delegate();

        // Subscribe the node to this headers delegates
        this.mouseOverDelegate.subscribe({fn: node.select, scope:node})
        this.mouseOutDelegate.subscribe({fn: node.deselect, scope:node})

        // call delegates on mouse events
        let self = this;
        this.svg.onmouseover = function() {self.mouseOverDelegate.invoke(this);} 
        this.svg.onmouseout = function() {self.mouseOutDelegate.invoke(this);} 
    }
}