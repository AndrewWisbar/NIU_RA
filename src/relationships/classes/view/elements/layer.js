class Layer {
    constructor(x, width, key, numNodes, nodeSpacing) {
        this.g = document.createElementNS(svgns, "g");
        this.rect = document.createElementNS(svgns, "rect");
        //rect.onmousedown = startDragColumn;


        this.nodes = [];
        this.x = x;
        this.width = width;
        this.key = key;
        this.numNodes = parseInt(numNodes);
        this.nodeSpacing = nodeSpacing;
    }

    draw(cont) {
        this.g.id =  `g_l${this.key}`;
        this.rect.onclick = swapColumns;
        this.rect.id = `layer_${this.key}`
        this.rect.classList.add("layer")
        this.rect.classList.add("graph_el")
        this.rect.setAttribute("x", this.x);
        this.rect.setAttribute("y", 0);
        this.rect.setAttribute("width", this.width);
        this.rect.setAttribute("height", this.nodeSpacing * this.numNodes);
        this.rect.setAttribute("fill", ColorMapper.getLayerColor(this.key, 64));
        
        this.g.appendChild(this.rect);
        cont.appendChild(this.g);

        this.nodes.forEach(node => {
            node.draw(this.g);
        }) 
    }

    setNodes(nodes) {
        this.nodes = nodes;
    }

    getNode(index) {
        if(index >= 0 && index < this.nodes.length) {
            return this.nodes[index];
        }

        return null;
    }

    getNumNodes() {
        return this.numNodes;
    }
}