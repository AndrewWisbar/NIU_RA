class Table {
    constructor(elements, entries, origin, drawHeaders, colors, id, container, flip = false) {
        this.ele = elements;
        this.entryData = entries;
        this.org = {x: origin.x, y: origin.y};

        this.entryEle = [];
        this.headers = [];

        this.id = id;

        this.colors = colors;

        // list of two bools: Should we draw headers for each list of elements?
        this.headerFlags = drawHeaders;
        
        this.cont = container;

        this.selectFlag = true;
        this.flip = flip;
        this.svg = document.createElementNS(svgns, "g");
        this.create();
    }

    create() {
        let rows, cols;

        rows = this.ele[1].length + this.headerFlags[0];
        cols = this.ele[0].length + this.headerFlags[1];

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
                        entry.setAttribute("fill", this.colors[1]+"7F")
                        entry.setAttribute("stroke", this.colors[1])
                        entry.setAttribute("id", `l${this.id + 1}n${index.j}_tab`)
                        if(this.selectFlag) {
                            entry.setAttribute("onmouseover", "selectTableNode(this)");
                            entry.setAttribute("onmouseout", "deselectTableNode(this)");
                        }
                    }
                    else if(j == 0 && this.headerFlags[0]) {
                        entry.setAttribute("fill", this.colors[0]+"7F")
                        entry.setAttribute("stroke", this.colors[0])
                        entry.setAttribute("id", `l${this.id}n${index.i}_tab`)
                        if(this.selectFlag) {
                            entry.setAttribute("onmouseover", "selectTableNode(this)");
                            entry.setAttribute("onmouseout", "deselectTableNode(this)");
                        }
                    }
                    else {
                        entry.setAttribute("fill", NODE_COL)
                        if(!this.flip) {
                            entry.setAttribute("id", `l${this.id}n${index.i}l${this.id+1}n${index.j}_tab`)
                            if(this.entryData[index.i][index.j].w == 0)
                                entry.setAttribute("fill", "black")
                            }
                        else {
                            entry.setAttribute("id", `l${this.id - 1}n${index.j}l${this.id}n${index.i}_tab`)
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