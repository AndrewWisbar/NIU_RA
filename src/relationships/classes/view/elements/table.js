/**
 * A tabular view of the connection between two layers in the graph
 */
class Table {
    constructor(elements, entries, origin, drawHeaders, colors, pos_ind, layer1, layer2, id_ord, container, nodes) {
        this.ele = elements;
        this.entryData = entries;
        this.org = {x: origin.x, y: origin.y};
        this.entryEle = [];
        this.headers = [];

        this.pos_ind = pos_ind
        this.layer1 = layer1;
        this.layer2 = layer2;
        this.id_ord = id_ord;
        this.colors = colors;

        this.nodes = nodes;

        // list of two bools: Should we draw headers for each list of elements?
        this.headerFlags = drawHeaders;
        
        this.cont = container;
        this.selectFlag = true;
        this.svg = document.createElementNS(svgns, "g");
        this.create();
    }

    create() {
        let rows, cols;
        console.log(this.nodes)
        rows = this.ele[1] + this.headerFlags[0];
        cols = this.ele[0] + this.headerFlags[1];
        for(let j = 0; j < rows; j++) {
            for(let i = 0; i < cols; i++) {
                if(!((this.headerFlags[0] && this.headerFlags[1]) && (i == 0 && j == 0))) {
                    let index = {i: (this.headerFlags[1]) ? i-1 : i, j: (this.headerFlags[0]) ? j-1 : j};
                    let entry = document.createElementNS(svgns, "rect");
                    
                    this.cont.appendChild(entry);
                    entry.setAttribute("x", this.org.x + (i * CELL_W));
                    entry.setAttribute("y", this.org.y + (j * CELL_H));
                    entry.setAttribute("width", CELL_W);
                    entry.setAttribute("height", CELL_H);
                    entry.setAttribute("stroke", "black")
                    entry.classList.add("table_cell")
                    if(i == 0 && this.headerFlags[1]) {
                        entry.setAttribute("fill", ColorMapper.getLayerColor(this.layer2, 127))
                        entry.setAttribute("stroke", ColorMapper.getLayerColor(this.layer2))
                        entry.setAttribute("id", `l${this.layer2}n${index.j}_tab`)
                        if(this.selectFlag) {
                            entry.setAttribute("onmouseover", "selectTableNode(this)");
                            entry.setAttribute("onmouseout", "deselectTableNode(this)");
                        }
                        this.headers.push(new TableHeader(entry, this.nodes[1].getNode(index.j)))
                    }
                    else if(j == 0 && this.headerFlags[0]) {
                        entry.setAttribute("fill", ColorMapper.getLayerColor(this.layer1, 127))
                        entry.setAttribute("stroke", ColorMapper.getLayerColor(this.layer1))
                        entry.id = `l${this.layer1}n${index.i}_tab`;
                        if(this.selectFlag) {
                            entry.setAttribute("onmouseover", "selectTableNode(this)");
                            entry.setAttribute("onmouseout", "deselectTableNode(this)");
                        }
                        this.headers.push(new TableHeader(entry, this.nodes[0].getNode(index.i)))
                    }
                    else {
                        if(this.pos_ind%2 == 0) {
                            entry.setAttribute("fill", ColorMapper.nodeColor)
                            entry.setAttribute("id", `l${this.id_ord[0]}n${index.i}l${this.id_ord[1]}n${index.j}_tab`)
                            if(this.entryData[index.i][index.j].w == 0)
                                entry.setAttribute("fill", "black")
                        }
                        else {
                            entry.setAttribute("fill", ColorMapper.nodeColor)
                            entry.setAttribute("id", `l${this.id_ord[0]}n${index.j}l${this.id_ord[1]}n${index.i}_tab`)
                            if(this.entryData[index.j][index.i].w == 0)
                                entry.setAttribute("fill", "black")
                        }
                    }
                }
            }
        }
    }

    show() {

    }
}