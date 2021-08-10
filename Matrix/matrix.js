let m1 = [];
let m2 = [];

const c1 = document.getElementById('c1');
const c2 = document.getElementById('c2');

let drawn = false;

const canv = document.getElementById("matrix-canv");
const ctx = canv.getContext('2d');

const w_sel = document.getElementById('width-slider');
const h_sel = document.getElementById('height-slider');

ctx.fillStyle = 'rgb(51,51,51)';
ctx.fillRect(0, 0, canv.width, canv.height);

let m_height = null;
let m_width = null;

function generate() {
    
    m_width = parseInt(w_sel.value);
    m_height = parseInt(h_sel.value);
    m1 = new Array(m_width);
    m2 = new Array(m_width);
    for(let i = 0; i < m1.length; i++) {
        m1[i] = new Array(m_height);
        m2[i] = new Array(m_height);

        
    }

    for(let i = 0; i < m1.length; i++) {
        for(let j = 0; j < m1[i].length; j++) {
            m1[i][j] = Math.random() < 0.5;
            m2[i][j] = Math.random() < 0.5;
        }
    }
    draw();
   
}


function redraw() {
    if(!drawn)
        generate();

    draw();
}

function draw() {
    ctx.fillStyle = 'rgb(51,51,51)';
    ctx.fillRect(0, 0, canv.width, canv.height);

    if(!m_width || !m_height) {
        m_width = parseInt(w_sel.value);
        m_height = parseInt(h_sel.value);
    }
    let big_dim = (m_width > m_height) ? m_width : m_height;

    let side_l = canv.width / big_dim;

    for(let i = 0; i < m1.length; i++) {
        for(let j = 0; j < m1[i].length; j++) {

            let fill;

            let logic_sel = get_selection();

            switch(logic_sel.value) {
                case "o":
                    if(m1[i][j] && !m2[i][j])
                        fill = 'rgb(147, 183, 190)';
                    else if(m2[i][j] && !m1[i][j])
                        fill = 'rgb(237, 235, 160)';
                    else if(m1[i][j] && m2[i][j])
                        fill = 'rgb(159, 223, 164)';
                    else
                        fill = 'rgb(31, 39, 22)';
                    break;
                case "a":
                    if(m1[i][j] && m2[i][j])
                        fill = 'rgb(159, 223, 164)';
                    else
                        fill = 'rgb(31, 39, 22)';
                    break;
                default:
                case "x":
                    if(m1[i][j] && !m2[i][j])
                        fill = 'rgb(147, 183, 190)';
                    else if(m2[i][j] && !m1[i][j])
                        fill = 'rgb(237, 235, 160)';
                    else
                        fill = 'rgb(31, 39, 22)';
                    break;
            }
            

            ctx.fillStyle = fill;
            ctx.strokeStyle = 'black';
            ctx.fillRect(i * side_l, j * side_l, side_l, side_l);
            ctx.strokeRect(i * side_l, j * side_l, side_l, side_l);
            
        }
    }
    drawn = true;
}

function get_selection() {
    var buttons = document.getElementsByName("LOGIC");

    for(let i = 0; i < buttons.length; i++) {
        if(buttons[i].checked)
            return buttons[i];
    }
}