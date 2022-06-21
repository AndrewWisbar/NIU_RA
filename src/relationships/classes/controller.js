/**
 * The Object through which user interaction with the app is handled
 */
class Controller {
    constructor(numGroups) {
        this.slide_div = document.getElementById("group-controls");

        this.node_sliders = [];
        this.perc_sliders = [];

        this.highlight_select = document.getElementById("type-sel");
        this.recursive_check = document.getElementById("recursive");

        this.updateGroups(numGroups)
        this.data = new Data(numGroups, this.getGroupSizes(), this.getPercents());
        this.view = new View()

    }

    toggleView() {
        this.view.toggleView();
    }

    /**
     * Handler for the user changing the number of layers in the graph
     * @param {Number} num the number of layers 
     */
    updateGroups(num) {
        let oldNodeVals = [];
        let oldPercVals = [];
        this.node_sliders.forEach(slider => {
            oldNodeVals.push(slider.value);
        })
        this.perc_sliders.forEach(slider => {
            oldPercVals.push(slider.value);
        })
        this.node_sliders = [];
        this.perc_sliders = [];
        this.slide_div.innerHTML = "";
        for (let i = 0; i < num; i++) {
            let slider = document.createElement("input");
            let label = document.createElement("label");
            label.setAttribute("for", "slider" + i);
            label.innerHTML = i
            slider.setAttribute("type", "number");
            slider.setAttribute("min", GROUP_MIN);
            slider.setAttribute("max", GROUP_MAX);
            slider.setAttribute("id", "slider_" + i);
            if(i < oldNodeVals.length)
                slider.setAttribute("value", oldNodeVals[i]);
            else
                slider.setAttribute("value", 3);
            
            this.slide_div.appendChild(label)
            this.slide_div.appendChild(slider);
            this.slide_div.appendChild(document.createElement("br"))

            this.node_sliders.push(slider);
        }

        for (let i = 1; i < num; i++) {
            let slider = document.createElement("input");
            let label = document.createElement("label")
            label.setAttribute("for", "con_" + (i - 1) + "_" + i)
            label.setAttribute("id", "label_" + (i - 1) + "_" + i)
            label.innerHTML = "Connections: Layer " + (i - 1) + " to " + i + " (100%)";
            slider.setAttribute("type", "range");
            slider.setAttribute("min", 1);
            slider.setAttribute("max", 100);
            slider.setAttribute("id", "con_" + (i - 1) + "_" + i);
            if(i < oldPercVals.length)
                slider.setAttribute("value", oldPercVals[i]);
            else
                slider.setAttribute("value", 100);
            slider.setAttribute("oninput", `change_label(this, ${i - 1}, ${i})`)
            this.perc_sliders.push(slider)
            this.slide_div.appendChild(label)
            this.slide_div.appendChild(slider);
            this.slide_div.appendChild(document.createElement("br"))
        }
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
        let arr = [];
        this.perc_sliders.forEach(slider => {
            arr.push(slider.value);
        })
        return arr;
    }

    /**
     * Create the data for, and render the graph, based on user controls
     */
    render() {
        this.data.update(this.getGroupSizes(), this.getPercents());
        if(DEBUG)
            this.data.log();
        this.data.send();
        this.data.fillInterfaces();
        this.view.renderGraph(this.data.getLayers(), this.data.getInterfaces());
    }

    /**
     * Highlight a specific node for user
     * @param {String} id the id of the SVG selected by the user 
     */
    selectNode(id) {
        if(!this.recursive_check.checked)
            this.view.selectNode(id, this.highlight_select.value);
        else
            this.view.recursiveSelect(id, this.highlight_select.value)
    }

    /**
     * Return a highlighted node to its original state
     * @param {String} id the id of the node to reset
     */
    deselectNode(id) {
        if(!this.recursive_check.checked)
            this.view.deselectNode(id);
        else
            this.view.recursiveDeselect(id, this.highlight_select.value)
    }

    /**
     * Pass the data recieved from an AJAX call back down to the data object
     * @param {Object} data the data sent back by the AJAX request
     */
    storeData(data) {
        this.data.storeData(data);
    }

    /**
     * Visually Highlight a clique selected by the user
     * @param {String} id the ID of the SVG element representing the clique
     */
    selectClique(id) {
        this.view.selectClique(id, this.highlight_select.value);
    }

    /**
     * Visually Reset a clique that was previously selected by the user
     * @param {String} id the ID of the SVG element representing the clique 
     */
    deselectClique(id) {
        this.view.deselectClique(id, this.highlight_select.value);
    }

    startDragColumn(event) {
        console.log(event)
        document.addEventListener(onmousemove, dragColumn);
        document.addEventListener(onmouseup, endDragColumn);
        this.view.startDragColumn();
    }

    zoom(e) {
        this.view.zoom(e.deltaY, e.path);
    }

    startPan(e) {
        this.view.startPan(e.clientX, e.clientY, e.target);
    }

    pan(e) {
        this.view.pan(e.clientX, e.clientY, e.path);
    }

    endPan(target) {
        this.view.endPan(target);
    }
}