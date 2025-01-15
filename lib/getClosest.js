import { availableColors } from "/lib/palette.js";
export function getClosest(goal = [], performance = true) {
    const indexs = []
    let closest = [1]
    for (let i = 0; i < availableColors.length; i++) {
        const rgbColor = availableColors[i];
        const [r1, g1, b1] = rgbColor.map((x) => x / 255)
        const [r2, g2, b2] = goal.map((x) => x / 255)
        if (performance === true) {


            const distance = ((Math.abs(r1 - r2)) + Math.abs(g1 - g2) + Math.abs(b1 - b2)) / 3
            if (distance < closest[0]) {
                closest[0] = distance
                closest[1] = rgbColor
            }
        }
        else {
            indexs.push(Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2))

            const distance = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
            if(distance < closest[0]){
                closest[0] = distance
                closest[1] = rgbColor
            }

        }
    }
    return closest[1]
};

export function getRgbArray(hexCode = "") {
    return [parseInt((hexCode[0] + hexCode[1]), 16), parseInt((hexCode[2] + hexCode[3]), 16), parseInt((hexCode[4] + hexCode[5]), 16)]
}

export function getHexCode(rgbArray) {
    const hexCode = []
    for (let i = 0; i < rgbArray.length; i++) {
        const hexValue = rgbArray[i].toString(16)
        hexCode.push(hexValue.length < 2 ? "0" + hexValue : hexValue)
    }
    return hexCode.join("") + "ff"
}