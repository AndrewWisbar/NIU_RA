let controller = new Controller(2);

function update_groups(value) {
    controller.updateGroups(value)
}

/**
 * Event hander for generating graph and its tabular representation
 */
 function draw_graph() {
    controller.render();
}


function change_label(slider, val1, val2) {
    let label = slider.labels
    label[0].innerHTML = `Connections Layer ${val1} to ${val2} (${slider.value}%)`
}

function change_lcm_label(slider, val1, val2) {
    let label = slider.labels
    label[0].innerHTML = `LCM Parameter${val1} to ${val2} (${slider.value})`
}


function change_LCM(num, val) {
    controller.updateLCM(num, val)
}

function select_node(node) {
    controller.selectNode(node.id);
}

function deselect_node(node) {
    controller.deselectNode(node.id);
}

function catchData(data) {
    controller.storeData(data)
}

function selectTableNode(tab) {
    controller.selectNode(tab.id.replace("_tab", ""));
}

function deselectTableNode(tab) {
    controller.deselectNode(tab.id.replace("_tab", ""));
}

function selectClique(id) {
    controller.selectClique(id);
}

function deselectClique(id) {
    controller.deselectClique(id);
}

function toggle_view() {
    controller.toggleView();
}

function startDragColumn(e) {
    document.addEventListener("mousemove", dragColumn);
    document.addEventListener("mouseup", endDragColumn);
    controller.startDragColumn(e.target)
}

function dragColumn(e) {
    console.log(e)
}

function endDragColumn(e) {
    document.removeEventListener("mousemove", dragColumn);
    document.removeEventListener("mouseup", endDragColumn)
    console.log(`end`)
}

function zoom(e) {
    controller.zoom(e);
}

function startPan(e) {
    if(e.target.id == "container" || e.target.id == "table-svg")
        controller.startPan(e)
}

function pan(e) {
    controller.pan(e);
}

function endPan(e) {
    controller.endPan(e.path);
}