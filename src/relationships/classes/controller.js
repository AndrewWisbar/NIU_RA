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

    updateGroups(num) {
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

    render() {
        this.data.update(this.getGroupSizes(), this.getPercents());
        if(DEBUG)
            this.data.log();
        this.data.send();
        this.data.fillInterfaces();
        this.view.renderGraph(this.data.getLayers(), this.data.getInterfaces());
    }

    selectNode(id) {
        if(!this.recursive_check.checked)
            this.view.select(id, this.highlight_select.value);
        else
            this.view.recursiveSelect(id, this.highlight_select.value)
    }

    deselectNode(id) {
        this.view.deselect(id);
    }

    storeData(data) {
        this.data.storeData(data);
    }
}