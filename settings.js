const svgns = "http://www.w3.org/2000/svg"; // namespace for svg elements


/*******************************************************************************
 * Relationship Constants
 */

//The color used to highlight whatever element the user is inspecting
const SEL_COL =                 'rgb(235, 150, 235)'     // Previously used for highlighting nodes
const NODE_COL =                'rgba(150, 150, 150, 1)' // default node color
const BW_CUTOFF =               0.725;  // Weight threshold for disiding white or black text

const GROUP_MIN =               2;   // Minimum number of nodes in a layer
const GROUP_MAX =               10;  // Maximum number of nodes in a layer

const LAYER_COLS = [            // Unique colors for each layer of nodes
                                "#9553A2",
                                "#DA4E8B",
                                "#DB7C6B",
                                "#8FB34D",
                                "#3E92CC"
]

const NODE_SIZE =               0.25 // the size of the node relative to its vertical spacing

const CELL_W =                  24;
const CELL_H =                  24;


/*******************************************************************************
 * Image Linking Constants
 */

const NUM_IMAGES =              8; // number of images in images folder