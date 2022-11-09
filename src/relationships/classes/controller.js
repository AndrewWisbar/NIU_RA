/**
 * The Object through which user interaction with the app is handled
 */
class Controller {
    #data;
    #view;
    constructor(numGroups) {
        this.lcm_grid = document.getElementById("lcm_grid");
        this.slider_grid = document.getElementById("slider_grid");
        this.layers_grid = document.getElementById("layers_grid")
        this.popup = document.getElementById("popup_cont");
        
        this.swapLayer1 = null;

        this.node_sliders = [];
        this.perc_sliders = {};
        this.lcm_sliders = [];

        this.highlight_select = document.getElementById("type-sel");
        this.recursive_check = document.getElementById("recursive");
        this.cliques_check = document.getElementById("goodCliques");

        this.updateGroups(numGroups)
        this.popupShow();
        this.#data = new Data(numGroups, this.getGroupSizes(), this.getPercents(), this.getLCMParams());
        this.#view = new View()
    }

    popupShow() {
        this.popup.classList.remove("hide");
    }

    popupHide() {
        this.popup.classList.add("hide");
    }

    restart_graph() {
        this.popupShow();
    }

    /**
     * Handler for the user changing the number of layers in the graph
     * @param {Number} num the number of layers 
     */
    updateGroups(num) {
        num = parseInt(num)
        let oldNodeVals = [];
        let oldPercVals = {};
        let oldLCMVals = [];
        this.node_sliders.forEach(slider => {
            oldNodeVals.push(slider.value);
        })

        for(let key in this.perc_sliders) {
            oldPercVals[key] = this.perc_sliders[key].value;
        }

        this.lcm_sliders.forEach(slider => {
            oldLCMVals.push(slider.value);
        })

        this.node_sliders = [];
        this.perc_sliders = {};
        this.lcm_sliders = [];

        this.layers_grid.innerHTML = "";
        for (let i = 0; i < num; i++) {
            let slider = makeSlider(GROUP_MIN, GROUP_MAX, 3, "number", "slider_" + i);
            
            let title = document.createElement("p")
            title.innerHTML = i;
            title.style.gridRow = 1;
            title.classList.add("grid-header");
            
            slider.setAttribute("onchange", `change_LCM(${i}, this.value)`);
            
            slider.style.gridRow = 2;
            slider.classList.add("lcm_slider")
            this.layers_grid.appendChild(title);
            this.layers_grid.appendChild(slider);
            this.node_sliders.push(slider);
        }
        
        this.slider_grid.innerHTML = "";
        this.slider_grid.style.gridTemplateColumns = `repeat(${num + 1}, 1fr)`
        this.slider_grid.style.gridTemplateRows = `repeat(${num + 1}, 1fr)`
        this.slider_grid.style.width = `calc(${num} * 100px)`
        this.slider_grid.style.height = `calc(${num} * 100px)`
        for (let i = 0; i < num; i++) {
            for(let j = 0; j < num; j++) {
                if(i == 0) {
                    
                    let div = document.createElement("div");
                    let lab = document.createElement("p");
                    lab.classList.add("connect_header");
                    lab.innerHTML = `${j}`
                    div.classList.add("grid_ele")
                    div.style.gridColumn = `${j + 2} / span 1`;
                    div.style.gridRow = `${1} / span 1`;
                    div.appendChild(lab)
                    this.slider_grid.appendChild(div);
                }
                
                if (j == 0) {
                    let div = document.createElement("div");
                    let lab = document.createElement("p");
                    lab.classList.add("connect_header");
                    lab.innerHTML = `${i}`
                    div.classList.add("grid_ele")
                    div.style.gridColumn = `${1} / span 1`;
                    div.style.gridRow = `${i + 2} / span 1`;
                    div.appendChild(lab)
                    this.slider_grid.appendChild(div);
                }

                if(j > i) {
                    let value;
                    if(`${i}-${j}` in oldPercVals)
                        value = oldPercVals[`${i}-${j}`];
                    else 
                        value = 100;

                    let slider = makeSlider(1, 100, value, "range", "con_" + i + "_" + j);
                    slider.setAttribute("oninput", `change_label(this)`);
                    slider.classList.add("connect_slider");

                    let label = document.createElement("label");
                    label.setAttribute("for", "con_" + i + "_" + j);
                    label.innerHTML = `${value}%`
                    label.classList.add("connect_label")
                    
                    let div = document.createElement("div");
                    div.classList.add("grid_ele");
                    div.style.gridColumn = `${j + 2} / span 1`;
                    div.style.gridRow = `${i + 2} / span 1`;
                    div.appendChild(label);
                    div.appendChild(slider);
                    
                    this.perc_sliders[`${i}-${j}`] = slider;
                    this.slider_grid.appendChild(div);
                }
                else {
                    let div = document.createElement("div");
                    div.classList.add("grid_ele")
                    div.classList.add("crossed");
                    div.style.gridColumn = `${j + 2} / span 1`;
                    div.style.gridRow = `${i + 2} / span 1`;
                    this.slider_grid.appendChild(div);
                }
            }
        }
        let div = document.createElement("div");
        div.classList.add("grid_ele")
        div.style.gridColumn = `${1} / span 1`;
        div.style.gridRow = `${1} / span 1`;
        this.slider_grid.appendChild(div);


        this.lcm_grid.innerHTML = "";
        for (let i = 0; i < num; i++) {
            let slider = makeSlider(1, parseInt(this.node_sliders[i].value), 2, "range", "lcm_" + i)
            let title = document.createElement("p")
            title.innerHTML = i;
            title.style.gridRow = 1;
            title.classList.add("grid-header");

            slider.setAttribute("oninput", `change_lcm_label(this, ${i})`)
            slider.style.gridRow = 2;
            
            this.lcm_grid.appendChild(title);
            this.lcm_sliders.push(slider)
            this.lcm_grid.appendChild(slider);
        }
    }
    
    updateLCM(num, val) {
        if(num < this.lcm_sliders.length)
            this.lcm_sliders[num].max = val;
    }

    /**
     * Get an array of the number of nodes in each layer of the graph
     * @returns an array representing the number of nodes in each layer
     */
    getGroupSizes() {
        let arr = [];
        this.node_sliders.forEach(slider => {
            arr.push(slider.value);
        })
        return arr;
    }

    /**
     * Get an array of the percentage of edges precent between each consecutive 
     *     layer of the graph
     * @returns an array containing the percentage of edges between each layer 
     *     of the graph
     */
    getPercents() {
        let arr = {};
        for(let key in this.perc_sliders) {
            arr[key] = this.perc_sliders[key].value;
        }
        return arr;
    }

    getLCMParams() {
        let arr = [];
        this.lcm_sliders.forEach(slider => {
            arr.push(slider.value);
        })
        return arr;
    }

    /**
     * Create the data for, and render the graph, based on user controls
     */
    render() {
        this.popupHide();
        console.clear();
        this.#view.displayLoading();
        
        this.#data.generate(this.getGroupSizes(), this.getPercents(), this.getLCMParams())
        if(DEBUG)
            this.#data.log();
        this.#data.fillInterfaces();
        
        this.#view.renderGraph(this.#data.getLayers(), this.#data.getInterfaces());
        if(DEBUG) {
            this.getIntersections();
        }
    }

    /**
     * Highlight a specific node for user
     * @param {String} id the id of the SVG selected by the user 
     */
    selectNode(id) {
        if(!this.recursive_check.checked)
            this.#view.selectNode(id, this.highlight_select.value);
        else
            this.#view.recursiveSelect(id, this.highlight_select.value)
    }

    /**
     * Return a highlighted node to its original state
     * @param {String} id the id of the node to reset
     */
    deselectNode(id) {
        if(!this.recursive_check.checked)
            this.#view.deselectNode(id);
        else
            this.#view.recursiveDeselect(id, this.highlight_select.value)
    }

    /**
     * Pass the data recieved from an AJAX call back down to the data object
     * @param {Object} data the data sent back by the AJAX request
     */
    storeData(data) {
        this.#data.storeData(data);
        /*if(this.#data.dataSentNum == this.#data.dataReturnedNum) {
            this.#data.fillInterfaces();
            this.#view.renderGraph(this.#data.getLayers(), this.#data.getInterfaces());
        }*/
    }

    /**
     * Visually Highlight a clique selected by the user
     * @param {String} id the ID of the SVG element representing the clique
     */
    selectClique(id) {
        this.#view.selectClique(id, this.highlight_select.value);
    }

    /**
     * Visually Reset a clique that was previously selected by the user
     * @param {String} id the ID of the SVG element representing the clique 
     */
    deselectClique(id) {
        this.#view.deselectClique(id, this.highlight_select.value);
    }

    startDragColumn(event) {
        document.addEventListener(onmousemove, dragColumn);
        document.addEventListener(onmouseup, endDragColumn);
        this.#view.startDragColumn();
    }

    zoom(e) {
        this.#view.zoom(e.deltaY, e.path);
    }

    swapColumns(e) {
        let ind = parseInt(e.target.id.match(/\d+/)[0]);
        if(this.swapLayer1 == null)
            this.swapLayer1 = ind;
        else {
            if(ind != this.swapLayer1) {
                this.#view.swapColumns(this.swapLayer1, ind);
                this.#view.renderGraph(this.#data.getLayers(), this.#data.getInterfaces());
                this.swapLayer1 = null;
            }
        }
    }

    startPan(e) {
        this.#view.startPan(e.clientX, e.clientY, e.target);
    }

    pan(e) {
        this.#view.pan(e.clientX, e.clientY, e.path);
    }

    endPan(path) {
        this.#view.endPan(path);
    }

    getIntersections() {
        let count = 0;

        let order = this.#view.getLayerOrder(); 
        let nodes = this.#view.getLayers();
        let intersections = new Map();
        for(let l = 0; l < order.length - 1; l++) {
            let layerCount = 0;
            let layer = order[l];
            let nextLayer = order[[l+1]]
            let set = this.#data.getEdgeSet(layer, nextLayer);
            console.log(set)
            for(let i = 0; i < nodes[layer].getNumNodes(); i++) {
                let nodeCount = 0;
                for(let j = 0; j < nodes[nextLayer].getNumNodes(); j++) {
                    if(set[i][j] != 0) {
                        let edgeCount = 0;
                        for(let m = i + 1; m < nodes[layer].getNumNodes(); m++) {
                            for(let n = 0; n < nodes[nextLayer].getNumNodes(); n++) {
                                let intersect = linearIntersect(nodes[layer].getNode(i), nodes[nextLayer].getNode(j), nodes[layer].getNode(m), nodes[nextLayer].getNode(n));
                                let key = `x${intersect.x}y${intersect.y}`;
                                if((m > i && n < j) && ((set[i][j] != 0) && (set[m][n] != 0))) {
                                    if(intersections.has(key)) {
                                        intersections.set(key, intersections.get(key) + 1)
                                    }
                                    else {
                                        intersections.set(key, 1);
                                    }
                                    edgeCount++;
                                }
                                else if (m < i && n > j && ((set[i][j] != 0) && (set[m][n] != 0))) {
                                    if(intersections.has(key)) {
                                        intersections.set(key, intersections.get(key) + 1)
                                    }
                                    else {
                                        intersections.set(key, 1);
                                    }
                                    edgeCount++;
                                }
                            }
                        }
                        console.log(`       Edge ${i}-${j} count = ${edgeCount}`);
                        nodeCount += edgeCount;
                    }
                }
                console.log(`   Node ${i} count = ${nodeCount}`);
                layerCount += nodeCount;
            }
            console.log(`--------------------\nLayer ${layer} count = ${layerCount}`);
            count += layerCount;
        }

        console.log(`Total: ${count} intersections, at ${intersections.size} unique locations.`);
        console.log(intersections)

        intersections.forEach((value, key) => {
            let vals = key.match(/[+-]?\d+(\.\d+)?/g);
            let circ = document.createElementNS(svgns, "circle")
            circ.setAttribute("cx", vals[0]);
            circ.setAttribute("cy", vals[1]);
            circ.setAttribute("r", 1);
            circ.setAttribute("fill", "red")
            this.#view.graphView.getSVG().appendChild(circ)
        })
    }

    dragCliqueStart(id, pos) {
        this.#view.dragCliqueStart(id, pos);
    }

    dragClique(id, pos) {
        this.#view.dragClique(id, pos);
    }

    dragCliqueEnd(id) {
        this.#view.dragCliqueEnd(id);
    }
}
