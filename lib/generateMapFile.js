import { mapColorPalette, availableColors } from "/lib/palette.js";
import { getClosest, getRgbArray, getHexCode } from "/lib/getClosest.js"
import { convertToAscii } from "./convertToAscii.js";

let GlobalComplements

onmessage = (e) => {
    console.time("worker" + e.data[2])
    GlobalComplements = e.data[1]
    const fileMapResult = createFileMap(e.data[0], e.data[3])
    postMessage([fileMapResult[0], fileMapResult[1]])
    console.timeEnd("worker" + e.data[2])
}


function createFileMap(imgData, perfMode) {
    const result = convertToMap(imgData, perfMode)
    const asciiFile = convertToAscii(result[0], true)
    return [asciiFile, result[1]]
}

function convertToMap(imgData, perfMode) {
    const allHexColors = []
    for (let i = 0; i < imgData.data.length; i = i + 4) {
        const rgba = [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]];
        allHexColors.push(rgba)
    }
    const myImgData = []
    const idColors = []
    for (let i = 0; i < allHexColors.length; i++) {
        const rgbArray = allHexColors[i];
        const color = getClosest(rgbArray, perfMode)

        try {
            idColors.push(mapColorPalette[getHexCode(rgbArray)].toString(16))
        }
        catch (e) {
            idColors.push(mapColorPalette[getHexCode(color)].toString(16))
        }
        myImgData.push(...color, 255)
    }
    console.log(myImgData)
    // const fullFile = GlobalComplements[0].split(" "), idColors, GlobalComplements[1].split(" ")
    idColors.unshift(...GlobalComplements[0].split(" "))
    idColors.push(...GlobalComplements[1].split(" "))
    return [idColors, new ImageData(new Uint8ClampedArray(myImgData),128)]
}


