const svgns = "http://www.w3.org/2000/svg";

//The color used to highlight whatever element the user is inspecting
const SELECT_COL = 'rgb(235, 150, 235)'
const BW_CUTOFF = 0.725;

const GROUP_MIN = 2;
const GROUP_MAX = 10;
let Y_DIV; //represents the vertical space between each node
let X_DIV;





/**
 * Represents a Bipartite graph, and contains tools to generate a graphical and
 *     tabular representation of that graph.
 */
class Graph {
    constructor(num_groups) {
        this.slide_div = document.getElementById("group-controls");
        this.num_groups = num_groups;
        this.groups = new Array(num_groups);
        this.node_nums = [];
        this.conn_sliders = [];

        this.groups.forEach(group => {
            group = [];
        })
        this.edges = [];
        this.container = document.getElementById('container');

        this.update_groups(num_groups)
    }

    /**
     * Show the connected edges and nodes of a given node to the user.
     * @param {number} id the id of the node whose connections should be shown
     */
    show_connections(id) {
        let indexes = id.match(/\d+/g);

        this.groups[indexes[0]][indexes[1]].show_connections();
    }

    /**
     * Reset the graph to its original state after show_connections has been 
     *     called.
     * @param {number} id the id of the node whose connections were shown
     */
    end_show(id) {
        let indexes = id.match(/\d+/g);

        this.groups[indexes[0]][indexes[1]].end_show();
    }

    /**
     * get a node object given its id.
     * @param {number} id 
     * @returns the desired node
     */
    get_node(group_ind, node_ind) {
        return this.groups[group_ind][node_ind]
    }

    /**
     * generate the information needed to show this graph
     */
    generate() {
        let nums = [];
        this.node_nums.forEach(input => {
            nums.push(parseInt(input.value, 10))
        })
        //this.connects = new Array(m).fill(new Array(n));

        this.groups = new Array(this.num_groups)
        for (let i = 0; i < this.num_groups; i++) {
            this.groups[i] = new Array(nums[i])
        }

        for (let i = 0; i < this.num_groups; i++) {
            for (let j = 0; j < nums[i]; j++) {
                this.groups[i][j] = new Node((.5 * X_DIV) + i * X_DIV, Y_DIV * j + .5 * Y_DIV, Y_DIV * .25, i + "_" + j)
            }
        }
        for (let g = 1; g < this.num_groups; g++) {
            let conns = Math.round(
                parseInt(this.conn_sliders[g - 1].value, 10) / 100 *
                (this.groups[g - 1].length * this.groups[g].length));

            let edges = []
            for (let i = 0; i < this.groups[g - 1].length; i++) {
                for (let j = 0; j < this.groups[g].length; j++) {
                    edges.push({ i: i, j: j })
                }
            }
            shuffle(edges);
            for (let i = 0; i < conns; i++) {
                let edge = edges[i];
                this.groups[g - 1][edge.i].connect(this.groups[g][edge.j]);
            }
        }
    }

    /**
     * Draw the graph to display it to the user
     */
    render() {

        for (let i = 0; i < this.num_groups; i++) {
            this.groups[i].forEach(node => node.draw_edges(this.container));
        }
        for (let i = 0; i < this.num_groups; i++) {
            this.groups[i].forEach(node => node.draw(this.container));
        }

        this.generate_table();
    }


    generate_table() {
        let cont = document.getElementById("table-cont");
        cont.innerHTML = ' ';
        for (let i = 1; i < this.num_groups; i++) {
            this.create_table(this.groups[i - 1], this.groups[i])
        }
    }

    /**
     * Generate a tabular representation of the connections between two groups
     *     of Nodes
     */
    create_table(m, n) {
        let cont = document.getElementById("table-cont");
        let table = document.createElement("table");
        cont.appendChild(table);
        let header = document.createElement("tr");
        let blank = document.createElement("th");
        header.appendChild(blank);
        n.forEach(node => {
            let entry = document.createElement('th');
            entry.setAttribute('id', "h_" + node.id);
            entry.setAttribute("onmouseover", "select_header(this)");
            entry.setAttribute("onmouseleave", "deselect_header(this)");
            let content = document.createTextNode(node.id);
            entry.appendChild(content);
            header.appendChild(entry);
        })

        table.appendChild(header);
        m.forEach(mNode => {
            let row = document.createElement("tr");
            let row_header = document.createElement('th');
            row_header.setAttribute("onmouseleave", "deselect_header(this)");
            row_header.setAttribute("onmouseover", "select_header(this)");
            row_header.setAttribute('id', "h_" + mNode.id);
            let content = document.createTextNode(mNode.id);
            row_header.appendChild(content)
            row.appendChild(row_header);


            n.forEach(nNode => {
                let data = document.createElement('td');
                data.setAttribute("id", mNode.id + "_" + nNode.id)
                let cont = document.createTextNode("0");
                let edge = mNode.get_edge(nNode);
                if (edge) {
                    data.setAttribute('onmouseover', 'select_cell(this)')
                    data.setAttribute('onmouseleave', 'deselect_cell(this)')
                    cont = document.createTextNode(Number.parseFloat(edge.weight).toFixed(3));
                    edge.cell = data;
                    if (document.getElementById('type-sel').value == 'gry') {
                        data.style.backgroundColor = edge.get_greyscale();
                        data.style.color = (edge.weight > .725) ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
                    }
                    else
                        data.style.backgroundColor = edge.get_color();
                }

                data.appendChild(cont);
                row.appendChild(data);
            })

            table.appendChild(row);
        })
    }

    /**
     * given two node indexes, return the edge that connects them
     * @param {number} m_ind The index of the desired "M node"
     * @param {number} n_ind The index of the "N node"
     * @returns the edge connecting the two given nodes if one exists, or null
     */
    get_edge(g1, g1_ind, g2, g2_ind) {
        return this.groups[g1][g1_ind].get_edge(this.groups[g2][g2_ind]);
    }

    update_groups(num) {
        this.node_nums = [];
        this.conn_sliders = [];
        this.slide_div.innerHTML = "";
        this.num_groups = num;
        for (let i = 0; i < num; i++) {
            let slider = document.createElement("input");
            let label = document.createElement("label");
            label.setAttribute("for", "slider" + i);
            label.innerHTML = i
            slider.setAttribute("type", "number");
            slider.setAttribute("min", GROUP_MIN);
            slider.setAttribute("max", GROUP_MAX);
            slider.setAttribute("id", "slider_" + i);
            slider.setAttribute("value", 3);

            this.slide_div.appendChild(label)
            this.slide_div.appendChild(slider);
            this.slide_div.appendChild(document.createElement("br"))

            this.node_nums.push(slider);
        }

        for (let i = 1; i < num; i++) {
            let slider = document.createElement("input");
            let label = document.createElement("label")
            label.setAttribute("for", "con_" + (i - 1) + "_" + i)
            label.setAttribute("id", "label_" + (i - 1) + "_" + i)
            label.innerHTML = "Connections Group " + (i - 1) + " to " + i + " (100%)";
            slider.setAttribute("type", "range");
            slider.setAttribute("min", 1);
            slider.setAttribute("max", 100);
            slider.setAttribute("id", "con_" + (i - 1) + "_" + i);
            slider.setAttribute("value", 100);
            slider.setAttribute("oninput", `change_label(this, ${i - 1}, ${i})`)
            this.conn_sliders.push(slider)
            this.slide_div.appendChild(label)
            this.slide_div.appendChild(slider);
            this.slide_div.appendChild(document.createElement("br"))
        }
    }
}

/**
 * Represtntative of a single node in a graph
 */
class Node {
    constructor(x, y, r, id, value) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.id = id;
        if (value)
            this.v = value;
        else
            this.v = null;

        this.edges = [];
        this.svg = null;
    }

    /**
     * Draw a representation of this node to show to the user
     * @param {HTMLElement} cont the SVG container the node is to be drawn in
     */
    draw(cont) {
        this.svg = document.createElementNS(svgns, "circle");
        cont.appendChild(this.svg);
        this.svg.setAttribute("cx", this.x);
        this.svg.setAttribute("cy", this.y);
        this.svg.setAttribute('r', this.r);
        this.svg.setAttribute('id', this.id);
        this.svg.setAttribute("fill", 'rgba(150, 150, 150, 1)');
        this.svg.setAttribute("stroke", 'rgb(0, 0, 0)');
        this.svg.setAttribute("onmouseover", "select_node(this)");
        this.svg.setAttribute("onmouseout", "deselect_node(this)");
    }

    /**
     * Get method for the position of this node
     * @returns a javascript object representing the position of the node
     */
    get_pos() {
        return { x: this.x, y: this.y };
    }

    /**
     * Draw the edges connected to this node
     * @param {HTMLElement} container SVG container element to draw this node 
     *     inside of
     */
    draw_edges(container) {
        this.edges.forEach(edge => {
            if (edge.nodes[0] == this)
                edge.draw(container)
        })
    }

    /**
     * Given another node, create an edge connecting these two
     * @param {Node} node the node to connect this one with 
     * @returns the generated Edge object connecting these nodes
     */
    connect(node) {
        let edge = new Edge(this, node)
        this.edges.push(edge);
        node.edges.push(edge)

        return edge;
    }

    /**
     * Highlight the nodes and edges connected to this node according to
     *     the currently selected option
     */
    show_connections(dir) {
        let check = document.getElementById("recursive").checked;
        this.svg.setAttribute("fill", SELECT_COL)
        let type = document.getElementById('type-sel').value
        this.edges.forEach(edge => {

            if (!(dir == 0 || dir == 1) || edge.nodes.indexOf(this) == dir) {
                let id = edge.nodes[0].id + "_" + edge.nodes[1].id;
                let cell = document.getElementById(id);
                cell.style.border = "5px solid black";
                if (type == "def") {
                    let id = edge.nodes[0].id + edge.nodes[1].id;
                    //let cell = document.getElementById(id);
                    let edge_color = edge.get_color();

                    edge.svg.setAttribute("stroke", edge_color)
                    //let other_node = edge.other(this)
                    //other_node.svg.setAttribute("fill", egde_color);
                }
                else if (type == "gry") {
                    let edge_color = edge.get_greyscale();
                    edge.svg.setAttribute("stroke", edge_color);
                }
                else if (type == "sze") {
                    edge.svg.setAttribute("stroke-width",
                        (edge.weight * edge.weight * 8 + 1) + "px")
                }
                else if (type == 'dsh') {
                    edge.svg.setAttribute("stroke-dasharray",
                        14 * (1 - edge.weight) + 1)
                }
                if (check)
                    edge.other(this).show_connections(edge.nodes.indexOf(this));
            }
        })
    }

    /**
     * Return all elements changed by show_connections to their original state
     */
    end_show(dir) {
        let check = document.getElementById("recursive").checked;
        this.svg.setAttribute("fill", 'rgba(150, 150, 150, 1)');
        this.edges.forEach(edge => {
            let id = edge.nodes[0].id + "_" + edge.nodes[1].id;
            let cell = document.getElementById(id);

            cell.style.border = "none"
            edge.svg.setAttribute("stroke", `rgba(0, 0, 0, 1)`)
            edge.svg.setAttribute("stroke-width", "3px")
            edge.svg.removeAttribute("stroke-dasharray");
            if (check && (!(dir == 0 || dir == 1) || edge.nodes.indexOf(this) == dir)) {
                edge.other(this).end_show(edge.nodes.indexOf(this));
            }
            //let other_node = edge.other(this)
            //other_node.svg.setAttribute("fill", `rgba(150, 150, 150, 1)`)
        })
    }

    /**
     * Get any edge that connects this node to the given node
     * @param {Node} node the Node that the desired edge should connect to
     * @returns the edge connecting "this" to "node" or null, if none exists
     */
    get_edge(node) {
        for (let i = 0; i < this.edges.length; i++)
            if (this.edges[i].nodes.includes(node)) {
                return this.edges[i];
            }
        return null;
    }
}

/**
 * Represents an edge conntecting two nodes in a graph
 */
class Edge {
    constructor(from_node, to_node) {
        this.nodes = [from_node, to_node];
        this.svg;
        this.weight = Math.random();
        this.drawn = false;
        this.cell = null;
    }

    /**
     * Create SVG objects to show this edge to the user.
     * @param {HTMLElement} cont SVG container object to draw the edge inside
     */
    draw(cont) {
        let from_pos = this.nodes[0].get_pos();
        let to_pos = this.nodes[1].get_pos();

        this.svg = document.createElementNS(svgns, "line");
        cont.appendChild(this.svg);
        this.svg.setAttribute('x1', from_pos.x);
        this.svg.setAttribute('y1', from_pos.y);
        this.svg.setAttribute('x2', to_pos.x);
        this.svg.setAttribute('y2', to_pos.y);
        this.svg.setAttribute("stroke", 'rgba(0, 0, 0, 1)');
        this.svg.setAttribute("stroke-width", `3px`)
        this.drawn = true;

    }

    /**
     * Given one of the nodes connected by this graph, return the other.
     * @param {Node} node The node to compare against
     * @returns The Node object connected to this edge that is not the one 
     *     passed to this method.
     */
    other(node) {
        return (this.nodes[0] == node) ? this.nodes[1] : this.nodes[0];
    }

    /**
     * Get the color that should be mapped to this edge based on its weight
     * @returns A string specifying an RGB color
     */
    get_color() {
        return `rgba(${this.weight < .5 ? 255 : 255 - 255 * 2 * (this.weight - .5)}, 
                     ${this.weight >= .5 ? 255 : 255 * 2 * (this.weight)}, 0, 1)`;
    }

    /**
     * Get the greyscale color that should be used to display this edge
     * @returns a string representing the color in RGB format
     */
    get_greyscale() {
        return `rgba(${255 - 255 * this.weight * this.weight}, 
                     ${255 - 255 * this.weight * this.weight}, 
                     ${255 - 255 * this.weight * this.weight}, 1)`
    }

    // get_dasharray() {
    //     let dasharray = "";
    //     let number;

    //     if(this.weight == 0)
    //         number = 0;
    //     else    
    //         number = Math.round( 1 / this.weight );

    //     console.log(this.weight, number)
    //     for(let i = 0; i < 10; i++) {
    //         dasharray += ((i % number == 0) ? "0 " : "2 ");
    //     }

    //     return dasharray;
    // }
}

/**
 * Given an array shuffle its contents into a random order
 * @param {Array} array an array to shuffle
 * @returns the a shuffled version of the original array
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * Event handler for user selecting a node
 * @param {HTMLElement} node the SVG element representing the node selected by
 *     the user
 */
function select_node(node) {
    document.getElementById("h_" + node.id).style.backgroundColor = SELECT_COL;
    g.show_connections(node.id);
}

/**
 * Event handler to return graph to original state after selecting a node
 * @param {HTMLElement} node the SVG representation of the node that was 
 *     selected 
 */
function deselect_node(node) {
    let header = document.getElementById("h_" + node.id)
    header.style.backgroundColor = 'rgb(128, 128, 128)';
    let index = parseInt(node.id.match(/\d+/), 10);
    g.end_show(node.id);
}

/**
 * Event handler for when a user selects a cell from the table
 * @param {HTMLElement} cell the td element from the table 
 */
function select_cell(cell) {
    cell.style.backgroundColor = SELECT_COL;

    //get the nodes that are attached to that cell/edge
    let nodes = cell.id.match(/\d+/g);
    let edge = g.get_edge(parseInt(nodes[0]),
        parseInt(nodes[1]),
        parseInt(nodes[2]),
        parseInt(nodes[3]));
    if (edge) {
        //highlight the corresponding edge
        edge.svg.setAttribute('stroke', SELECT_COL)
    }
}


/**
 * Event handler for returning the graph to its original state after a cell was
 *     selected by the user
 * @param {HTMLElement} cell the td element that was selected 
 */
function deselect_cell(cell) {

    //get the nodes that are attached to that cell/edge
    let nodes = cell.id.match(/\d+/g);
    let edge = g.get_edge(parseInt(nodes[0]),
        parseInt(nodes[1]),
        parseInt(nodes[2]),
        parseInt(nodes[3]));
    if (edge) {
        edge.svg.setAttribute('stroke', 'rgb(0, 0, 0)')
        if (document.getElementById("type-sel").value == 'gry')
            cell.style.backgroundColor = edge.get_greyscale();
        else
            cell.style.backgroundColor = edge.get_color();
    }
}

/**
 * Event handler for when the user selects a row or column header from the table
 * @param {HTMLElement} header The th cell that the user has selected
 */
function select_header(header) {
    header.style.backgroundColor = SELECT_COL;
    let indexes = header.id.match(/\d+/g);
    let node = g.get_node(indexes[0], indexes[1])
    node.show_connections();
}

/**
 * Event handler for returning the graph to its original state after a user has
 *     selected a header cell from the table
 * @param {*} header The th header cell that was being selected
 */
function deselect_header(header) {
    header.style.backgroundColor = 'rgb(128, 128, 128)';

    let indexes = header.id.match(/\d+/g);
    let node = g.get_node(indexes[0], indexes[1])
    node.end_show();
}

/**
 * Event hander for generating graph and its tabular representation
 */
function draw_graph() {
    let cont = document.getElementById("container");
    while (cont.firstChild) {
        cont.removeChild(cont.lastChild);
    }
    g.generate();
    g.render();
}

function update_groups(value) {
    g.update_groups(value)
}

/**
 * Color the cells of the table based on the option chosen by the user
 * @param {String} val the value that the type selector has been set to 
 */
function color_table(val) {
    g.m.forEach(mNode => {
        g.n.forEach(nNode => {
            let cell = document.getElementById(mNode.id + nNode.id)
            let edge = mNode.get_edge(nNode);
            if (edge) {
                if (val == "gry") {
                    cell.style.backgroundColor = edge.get_greyscale();
                    cell.style.color = (edge.weight > BW_CUTOFF) ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
                }
                else {
                    cell.style.backgroundColor = edge.get_color();
                    cell.style.color = 'rgb(0, 0, 0)'
                }
            }
        })
    })
}

function change_label(slider, val1, val2) {
    let label = slider.labels
    label[0].innerHTML = `Connections Group ${val1} to ${val2} (${slider.value}%)`
}

document.getElementById('container').onload = function () {
    let svg = document.getElementById('container')
    let height = svg.height.baseVal.value;
    let width = svg.width.baseVal.value;
    Y_DIV = height / GROUP_MAX
    X_DIV = width / 5

    console.log(X_DIV, Y_DIV)
}

let g = new Graph(2);