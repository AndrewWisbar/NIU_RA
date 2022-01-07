let col_string = "#00FFFF";

let img = document.getElementById("base-img");



cocoSsd.load().then(model => {
    model.detect(img).then(predictions => {
        rect_control.gotDetection(predictions);
    })
})