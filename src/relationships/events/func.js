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