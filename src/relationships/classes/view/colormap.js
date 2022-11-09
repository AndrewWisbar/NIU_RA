/**
 * Mostly (if not entirely) static class for handling color assignments
 */
class ColorMapper {
    static LayerColors = [            // Unique colors for each layer of nodes
        "#9553A2",
        "#DA4E8B",
        "#DB7C6B",
        "#8FB34D",
        "#3E92CC"
    ];

    // get the highlight type selector
    static typeSelector = document.getElementById("type-sel");

    //set default colors for elements
    static nodeColor = 'rgba(150, 150, 150, 1)';
    static cliqueColor = "#7b9ead";
    static cliqueSelectColor = "#FF3C3C"
    
    /**
     * Highlight an edge or path element based on the current state of typeSelector
     * @param {SVGElement} svg the svg to highlight 
     * @param {*} weight the weight of the element
     */
    static highlight(svg, weight) {
        switch(this.getHighlightType()) {
            default:
            case "def":
                this.setColor(svg, weight);
                break;

            case "gry":
                this.setGreyScale(svg, weight);
                break;

            case "sze":
                this.setSize(svg, weight);
                break;

            case "dsh":
                this.setDash(svg, weight);
                break;
        }
    }

    /**
     * Get the color associated with a sepecific weight, based on the current
     * state of the type selector element
     * @param {Float} weight 
     * @returns color as a string
     */
    static getHighlightColor(weight) {
        switch(this.getHighlightType()) {
            default:
            case "sze":
            case "dsh":
            case "def":
                return this.getColor(weight);
            case "gry":
                return this.getGreyScale(weight);
        }
    }

    /**
     * set the color of an edge or path
     * @param {SVGAElement} svg the element to change 
     * @param {float} weight the weight of the edge
     */
    static setColor(svg, weight) {
        svg.setAttribute("stroke", this.getColor(weight));
        svg.setAttribute("stroke-width", 5);
    }

    /**
     * set the greyscale color of an edge or path
     * @param {SVGAElement} svg the element to change 
     * @param {float} weight the weight of the edge
     */
    static setGreyScale(svg, weight) {
        svg.setAttribute("stroke", this.getGreyScale(weight));
        svg.setAttribute("stroke-width", 5);
    }

    /**
     * set the size of an edge or path for highighting
     * @param {SVGAElement} svg the element to change 
     * @param {float} weight the weight of the edge
     */
    static setSize(svg, weight) {
        svg.setAttribute("stroke-width", this.getSize(weight));
    }

    /**
     * set the dash pattern of an edge or path for highlighting
     * @param {SVGAElement} svg the element to change 
     * @param {float} weight the weight of the edge
     */
    static setDash(svg, weight) {
        svg.setAttribute("stroke-dasharray", this.getDashArray(weight));
        svg.setAttribute("stroke-width", 5);
    }

    /**
     * Get the color for a given edge weight
     * @param {Float} weight the weight of the edge
     * @returns a color as a string
     */
    static getColor(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;        
        return `rgba(${weight < .5 ? 255 : 255 - 255 * 2 * (weight - .5)}, 
                     ${weight >= .5 ? 255 : 255 * 2 * (weight)}, 0, 1)`;
    }

    /**
     * Get the current highlighting type
     */
    static getHighlightType() {
        return this.typeSelector.value;
    }

    /**
     * Get the greyscale color for a given edge weight
     * @param {Float} weight the weight of the edge
     * @returns a color as a string
     */
    static getGreyScale(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;        
        return `rgba(${(1 - weight) * 255}, ${(1 - weight) * 255}, 
                     ${(1 - weight) * 255}, 1)`;
    }

    /**
     * Get the size for a given edge weight
     * @param {Float} weight the weight of the edge
     * @returns size property as a string
     */
    static getSize(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;

        return `${weight * weight * 8 + 1}px`
    }

    /**
     * Get the dash array for a given edge weight
     * @param {Float} weight the weight of the edge
     * @returns a dash array as a string
     */
    static getDashArray(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;

        return `${14 * (1 - weight) + 1}`;
    }


    static getLayerColor(num, alpha = 255) {
        if(alpha < 0)
            alpha = 0;
        if(alpha > 255)
            alpha = 255;
        
        // Convert number to Hex String
        let alphaCode = alpha.toString(16).toUpperCase();
        
        // Pad the Hex string to two Hits
        if(alphaCode.length < 2)
            alphaCode = "0" + alphaCode;
        
        return this.LayerColors[num % this.LayerColors.length] + alphaCode;
    }
}