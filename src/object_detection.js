let img;
const img_num = 8;
let rct_c = {r:0, g:255, b:255};
let col_string = 'rgb(' + rct_c.r + ',' + rct_c.g + ',' + rct_c.b + ')';


function preload() {
    let img_ind = nf(Math.floor(Math.random() * img_num), 4, 0);
    let img_path = `images/img${img_ind}.jpg`;
    base_img.setAttribute('src', img_path);
    img = loadImage(img_path);
    detector = ml5.objectDetector('cocosd');

    
}

function gotDetection(error, results) {
    if(error)
        console.error(error);
    
    console.log(results);
    let img_box = base_img.getBoundingClientRect();
    for(let i = 0; i < results.length; i++) {
        let obj = results[i];
        let new_rect = document.createElementNS(svgns, "rect");
        new_rect.setAttribute('id', 'rect_' + svg_cont.childElementCount);

        svg_cont.appendChild(new_rect);

        new_rect.setAttribute("fill", col_string);
        new_rect.setAttribute("stroke-width", 2);
        new_rect.setAttribute("stroke", col_string);
        new_rect.setAttribute("fill-opacity", 0);
        new_rect.setAttribute('ondrop', "drop_handler(event)");
        new_rect.setAttribute('ondragover', "dragover_handler(event)");
        new_rect.addEventListener('dragenter', function(e) {
            e.preventDefault();
            e.target.classList.add('dragging');
        });
    
        new_rect.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.target.classList.remove('dragging');
        });

        
        new_rect.setAttribute("x", obj.normalized.x * img_box.width);
        new_rect.setAttribute("y", obj.normalized.y * img_box.height);
        new_rect.setAttribute("width", obj.normalized.width * img_box.width);
        new_rect.setAttribute("height", obj.normalized.height * img_box.height);

        new_rect.classList.add("finished_rect");
        new_rect.setAttribute("onmouseover", "select_rect(this)");

        regions.push(new selected_region(0, 0, 0, 0, new_rect.id));
        
        regions[i].rename(obj.label);
        regions[i].rectUpdate(new_rect);
        
    }
}


function setup () {
    let img_box = base_img.getBoundingClientRect();
    svg_cont.setAttribute("height", img_box.height);
    svg_cont.setAttribute("width", img_box.width);
    colorPicker.value  = rgbToHex(rct_c.r, rct_c.g, rct_c.b);
    detector.detect(img, gotDetection);

    noLoop();
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}