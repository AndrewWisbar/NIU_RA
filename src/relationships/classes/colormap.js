class ColorMapper {
    constructor() {

    }

    static getColor(weight) {
        return `rgba(${weight < .5 ? 255 : 255 - 255 * 2 * (weight - .5)}, 
                     ${weight >= .5 ? 255 : 255 * 2 * (weight)}, 0, 1)`;
    }

    static getGreyScale(weight) {
        return `rgba(${(1 - weight) * 255}, ${(1 - weight) * 255}, 
                     ${(1 - weight) * 255}, 1)`;
    }
}