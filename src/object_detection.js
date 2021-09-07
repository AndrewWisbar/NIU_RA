let col_string = "#00FFFF";

let img = document.getElementById("base-img");

function buildModel() {
    const mod = tf.sequential();

    mod.add(tf.layers.conv2d({
        inputShape: [28, 28, 1],
        filters: 8,
        kernelSize: 5,
        padding: 'same',
        activation: 'relu'
    }));
  
    mod.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2
    }));
  
    // Again we set  another convolution layer
    mod.add(tf.layers.conv2d({
        filters: 16,
        kernelSize: 5,
        padding: 'same',
        activation: 'relu'
    }));
      
    mod.add(tf.layers.maxPooling2d({
        poolSize: 3,
        strides: 3
    }));
  
    const numofClasses = 10;
    mod.add(tf.layers.flatten());
    mod.add(tf.layers.dense({
        units: numofClasses,
        activation: 'softmax'
    }));
  
    // Compile the model
    mod.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
  

    return mod;
}



cocoSsd.load().then(model => {
    model.detect(img).then(predictions => {
        gotDetection(predictions);
    })
})

function gotDetection(results) {    
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

        
        new_rect.setAttribute("x", obj.bbox[0]);
        new_rect.setAttribute("y", obj.bbox[1]);
        new_rect.setAttribute("width", obj.bbox[2]);
        new_rect.setAttribute("height", obj.bbox[3]);

        new_rect.classList.add("finished_rect");
        new_rect.setAttribute("onmouseover", "select_rect(this)");

        regions.push(new selected_region(0, 0, 0, 0, new_rect.id));
        
        regions[i].rename(obj.class);
        regions[i].rectUpdate(new_rect);
    }
}


let mod = buildModel();
const surface = {name:'Model Summary', tab: 'Model Inspection'};
tfvis.show.modelSummary(surface, mod);