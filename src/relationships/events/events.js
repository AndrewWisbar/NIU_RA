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


function change_label(slider) {
    let label = slider.labels;
    label[0].innerHTML = `${slider.value}%`;
}

function change_lcm_label(slider, val1) {
    let label = slider.labels;
    label[0].innerHTML = `LCM Parameter for Layer ${val1} (${slider.value})`;
}


function change_LCM(num, val) {
    controller.updateLCM(num, val)
}

function catchData(data) {
    controller.storeData(data)
}

function swapColumns(e) {
    controller.swapColumns(e)
}

function startDragColumn(e) {
    document.addEventListener("mousemove", dragColumn);
    document.addEventListener("mouseup", endDragColumn);
    controller.startDragColumn(e.target)
}

function dragColumn(e) {
    console.log(e)
}

function restart_graph() {
    controller.restart_graph();
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

function dragCliqueStart(id, e) {
    pos = {x: e.offsetX, y:e.offsetY};
    controller.dragCliqueStart(id, pos);
}

function dragClique(id, e) {
    pos = {x: e.offsetX, y:e.offsetY};
    controller.dragClique(id, pos);
}

function dragCliqueEnd(id) {
    controller.dragCliqueEnd(id);
}


