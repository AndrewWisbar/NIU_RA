const svgns = "http://www.w3.org/2000/svg";
const SELECT_COL = 'rgb(20, 255, 255)'

class Graph {
    constructor() {
        this.m = [];
        this.n = [];
        this.edges = [];
        this.container = document.getElementById('container');
        this.m_slide = document.getElementById("m-slider");
        this.n_slide = document.getElementById('n-slider');
        this.con_slide = document.getElementById('con-slider');
    }

    show_connections(id) {
        let index = parseInt(id.match(/\d+/),10);

        if(id == 'm' + index)
            this.m[index].show_connections();
        else
            this.n[index].show_connections();
    }

    end_show(id) {
        let index = parseInt(id.match(/\d+/),10);

        if(id == 'm' + index)
            this.m[index].end_show();
        else
            this.n[index].end_show();
    }

    get_node(id) {
        
        let ind = parseInt(id.match(/\d+/, 10))

        if(id == "m" + ind)
            return this.m[ind];
        else
            return this.n[ind];
    }

    generate() {
        this.m = [];
        this.n = [];

        let m = parseInt(this.m_slide.value, 10);
        let n = parseInt(this.n_slide.value, 10);

        let width = this.container.width.baseVal.value;
        let height = this.container.height.baseVal.value;

        this.connects = new Array(m).fill(new Array(n));

        let conns = Math.round(parseInt(this.con_slide.value, 10)/ 100 * (m * n));

        // evenly divide vertical space
        let y_div = height / ((m >= n) ? m : n);

        //evenly divide horizontal
        let x_div = width/2

        //generate the m column
        for(let i = 0; i < this.m_slide.value; i++) {
            this.m.push(new Node(.5 * x_div, y_div * i + .5 * y_div, y_div * .25, "m" + i));   
        }

        //generate n column
        for(let i = 0; i < this.n_slide.value; i++) {
            this.n.push(new Node(1.5 * x_div, y_div * i + .5 * y_div, y_div * .25, "n" + i));   
        }


        let edges = []
        for(let i = 0; i < m; i++) {
            for(let j = 0; j < n; j++) {
                edges.push({i: i, j: j})
            }
        }
        shuffle(edges);
        for(let i = 0; i < conns; i++) {
            let edge = edges[i];
            let new_edge = this.m[edge.i].connect(this.n[edge.j]);
        }
    }

    render() {

        this.m.forEach(node => node.draw_edges(this.container));
        this.m.forEach(node => node.draw(this.container));
        this.n.forEach(node => node.draw(this.container));
        this.generate_table();
    }

    generate_table() {
        let table = document.getElementById("rel-tab");
        table.innerHTML = ' ';
        let header = document.createElement("tr");
        let blank = document.createElement("th");
        header.appendChild(blank);
        this.n.forEach(node => {
            let entry = document.createElement('th');
            entry.setAttribute('id', "h_" + node.id);
            entry.setAttribute("onmouseover", "select_header(this)");
            entry.setAttribute("onmouseleave", "deselect_header(this)");
            let content = document.createTextNode(node.id);
            entry.appendChild(content);
            header.appendChild(entry);
        })

        table.appendChild(header);
        this.m.forEach(mNode => {
            let row = document.createElement("tr");
            let row_header = document.createElement('th');
            row_header.setAttribute("onmouseleave", "deselect_header(this)");
            row_header.setAttribute("onmouseover", "select_header(this)");
            row_header.setAttribute('id', "h_" + mNode.id);
            let content = document.createTextNode(mNode.id);
            row_header.appendChild(content)
            row.appendChild(row_header);


            this.n.forEach(nNode => {
                let data = document.createElement('td');
                data.setAttribute("id", mNode.id + nNode.id)
                let cont = document.createTextNode("0");
                let edge = mNode.get_edge(nNode);
                if(edge) {
                    data.setAttribute('onmouseover', 'select_cell(this)')
                    data.setAttribute('onmouseleave', 'deselect_cell(this)')
                    cont = document.createTextNode(Number.parseFloat(edge.weight).toFixed(3));
                }
                
                data.appendChild(cont);
                row.appendChild(data);
            })

            table.appendChild(row);
        })
    }

    get_edge(m_ind, n_ind) {
        return this.m[m_ind].get_edge(this.n[n_ind]);
    }
}

class Node {
    constructor(x, y, r, id, value) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.id = id;
        if(value)
            this.v = value;
        else
            this.v = null;

        this.edges = [];
        this.svg = null;
    }

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

    get_pos() {
        return {x: this.x, y: this.y};
    }

    draw_edges(container) {
        this.edges.forEach(edge => edge.draw(container))
    }

    connect(node) {
        let edge = new Edge(this, node)
        this.edges.push(edge);
        node.edges.push(edge)

        return edge;
    }

    show_connections() {
        this.svg.setAttribute("fill", SELECT_COL)
        this.edges.forEach(edge => {
            let id = edge.nodes[0].id + edge.nodes[1].id;
            let cell = document.getElementById(id);
            let egde_color = `rgba(${edge.weight < .5 ? 255 : 255 - 255 * 2 * (edge.weight - .5)}, ${edge.weight > .5 ? 255 : 255 * 2 * (edge.weight)}, 0, 1)`;
            cell.style.backgroundColor = egde_color
            edge.svg.setAttribute("stroke", egde_color)
            edge.other(this).svg.setAttribute("fill", egde_color)
        })
    }

    end_show() {
        this.svg.setAttribute("fill", 'rgba(150, 150, 150, 1)');
        this.edges.forEach(edge => {
            let id = edge.nodes[0].id + edge.nodes[1].id;
            let cell = document.getElementById(id);

            cell.style.backgroundColor = `rgba(255, 255, 255, 1)`
            edge.svg.setAttribute("stroke", `rgba(0, 0, 0, 1)`)
            edge.other(this).svg.setAttribute("fill", `rgba(150, 150, 150, 1)`)
        })
    }

    get_edge(node) {
        for(let i = 0; i < this.edges.length; i++)
            if(this.edges[i].nodes.includes(node)) {
                return this.edges[i];
            }
        return null;
    }
}

class Edge {
    constructor(from_node, to_node) {
        this.nodes = [from_node, to_node];
        this.svg;
        this.weight = Math.random();
        this.drawn = false;
    }

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

    other(node) {
        return (this.nodes[0] == node) ? this.nodes[1] : this.nodes[0];
    }
}


function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

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

let g = new Graph();

function select_node(node) {
    node.setAttribute("stroke", 'rgb(0, 0, 0)');
    g.show_connections(node.id);
    node.classList.add("selected");
}

function deselect_node(node) {
    node.classList.remove("selected")
    let index = parseInt(node.id.match(/\d+/),10);
    g.end_show(node.id);
}

function select_cell(cell) {
    cell.style.backgroundColor = SELECT_COL;
    
    //get the nodes that belong to that 
    let nodes = cell.id.match(/\d+/g);
    let edge = g.get_edge(parseInt(nodes[0]), parseInt(nodes[1]));
    if(edge) {
        edge.svg.setAttribute('stroke', SELECT_COL)
    }
}

function deselect_cell(cell) {
    cell.style.backgroundColor = 'rgb(255, 255, 255)'
    //get the nodes that belong to that 
    let nodes = cell.id.match(/\d+/g);
    let edge = g.get_edge(parseInt(nodes[0]), parseInt(nodes[1]));
    if(edge) {
        edge.svg.setAttribute('stroke', 'rgb(0, 0, 0)')
    }
}

function select_header(header) {
    header.style.backgroundColor = SELECT_COL;

    let node = g.get_node(header.id.match(/\w\d+/)[0])
    node.show_connections();
}

function deselect_header(header) { 
    header.style.backgroundColor = 'rgb(128, 128, 128)';

    let node = g.get_node(header.id.match(/\w\d+/)[0])
    node.end_show();
}

function draw_graph() {
    let cont = document.getElementById("container");
    while(cont.firstChild) {
        cont.removeChild(cont.lastChild);
    }
    g.generate();
    g.render();
}