export function convertToAscii(hexFile = "", isHex) {
    const finalFile = []
    for (let i = 0; i < hexFile.length; i++) {

        let charCode = hexFile[i]
        if (isHex) {
            charCode = parseInt(hexFile[i], 16)
        }

        finalFile.push(String.fromCharCode(charCode))
        if (i == 92) {
        }
    }
    return finalFile
}