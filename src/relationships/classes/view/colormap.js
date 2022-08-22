class ColorMapper {
    static LayerColors = [            // Unique colors for each layer of nodes
        "#9553A2",
        "#DA4E8B",
        "#DB7C6B",
        "#8FB34D",
        "#3E92CC"
    ];

    static nodeColor = 'rgba(150, 150, 150, 1)';

    static getColor(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;        
        return `rgba(${weight < .5 ? 255 : 255 - 255 * 2 * (weight - .5)}, 
                     ${weight >= .5 ? 255 : 255 * 2 * (weight)}, 0, 1)`;
    }

    static getGreyScale(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;        
        return `rgba(${(1 - weight) * 255}, ${(1 - weight) * 255}, 
                     ${(1 - weight) * 255}, 1)`;
    }

    static getSize(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;

        return `${weight * weight * 8 + 1}px`
    }

    static getDashArray(weight) {
        if(weight < 0.0)
            weight = 0.0;
        if(weight > 1.0)
            weight = 1.0;

        return `${14 * (1 - weight) + 1}`;
    }

    // static getLayerColor(num) {
    //     return this.LayerColors[num % this.LayerColors.length];
    // }

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