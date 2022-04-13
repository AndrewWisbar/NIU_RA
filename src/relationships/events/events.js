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
    console.log(data)
    controller.storeData(data)
}

function selectTableNode(tab) {
    controller.selectNode(tab.id.replace("_tab", ""));
}

function deselectTableNode(tab) {
    controller.deselectNode(tab.id.replace("_tab", ""));
}

/**
 * Convert a string of integers to a sorted array of integers
 * @param {String} str
 * @return {Array} a sorted array of integers 
 */
function strToNumArr(str) {
    let nums = str.match(/\d+/g);
    for(let i = 0; i < nums.length; i++)
        nums[i] = parseInt(nums[i], 10)
    nums.sort(function(a, b) {
        return a - b;
    })

    return nums;
}

function idToIndex(id) {
    let nums = id.match(/\d/g);
    return {"l": nums[0], "n": nums[1]};
}