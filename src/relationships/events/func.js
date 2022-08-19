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
    let nums = id.match(/\d+/g);
    return {"l": nums[0], "n": nums[1]};
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
 * Make a deep copy of an array
 * @param {*} arr the array to copy
 * @returns the deep copy
 */
function cloneArray(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function clearElementChildren(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.lastChild);
    }
}

function makeSlider(min, max, val, type, id) {
    let slider = document.createElement("input");
    slider.setAttribute("type", type);
    slider.min = min;
    slider.max = max;
    slider.id = id;
    slider.value = val;

    return slider;
}

function invertArrayDimentions(inArr) {
    let iDim = inArr.length;
    let jDim = inArr[0].length;
    let outArray = new Array(jDim);
    
    for(let i = 0; i < outArray.length; i++)
        outArray[i] = new Array(iDim);

    for(let i = 0; i < inArr.length; i++) {
        for(let j = 0; j < inArr[i].length; j++) {
            outArray[j][i] = inArr[i][j];
        }
    }

    return outArray
}

function reverseCliques(inArr) {
    let outArr = new Array(inArr.length);

    for(let c = 0; c < inArr.length; c++) {
        outArr[c] = new Array(2);
        outArr[c][0] = inArr[c][1];
        outArr[c][1] = inArr[c][0];
    }

    return outArr
}

/**
 * Get the point at which two lines connecting the nodes intersect
 * 
 * n1 is connected to n2, n3 is conntected to n4.
 * @param {*} n1 
 * @param {*} n2 
 * @param {*} n3 
 * @param {*} n4 
 */
function linearIntersect(n1, n2, n3, n4) {
    let m1 = (n1.y - n2.y) / (n1.x - n2.x);
    let m2 = (n3.y - n4.y) / (n3.x - n4.x);
    let b1 = -n1.x * m1 + n1.y;
    let b2 = -n3.x * m2 + n3.y;

    let interX = (b2 - b1) / (m1 - m2);
    let interY = m1 * interX + b1;

    return {x: interX.toFixed(2), y: interY.toFixed(2)};
}