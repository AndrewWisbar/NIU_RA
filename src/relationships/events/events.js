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
    label[0].innerHTML = `Connections Group ${val1} to ${val2} (${slider.value}%)`
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

