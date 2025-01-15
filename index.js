import { convertToAscii } from "./lib/convertToAscii.js"
const canvas = document.getElementById("mapCanvas")
const canvasResult = document.getElementById("resultCanvas")
const ctx = canvas.getContext("2d")
const ctxResult = canvasResult.getContext("2d")
class myTextEncoder {
    constructor() {
        this.encode = (array = []) => {
            const returnArray = new Uint8Array(array.length)
            for (let i = 0; i < array.length; i++) {
                returnArray[i] = array[i].charCodeAt(0)
            }
            return returnArray
        }
    }
}


const imageElement = document.getElementById("mapInput")
imageElement.addEventListener("change", () => {
})

const sizeElement = document.getElementById("size")
let sizeValue = 128
let value = sizeElement.value
updateSize(value)
sizeElement.addEventListener("input", () => {
    value = sizeElement.value
    updateSize(value)
})


const input = document.getElementById('mapInput');

input.addEventListener('change', async function (e) {
    const [files] = e.target.files;
    const reader = new FileReader();
    reader.onloadend = () => {
        const image = new Image
        image.src = reader.result
        image.style.display = "none"
        document.body.append(image)
        fetchHeaders(image)
    }
    reader.readAsDataURL(files)
});

let GlobalComplements

function updateSize(newSize) {
    const pixelSize = newSize * 128
    const sizeIndicator = document.getElementById("sizeIndicator")
    // const areaIndicator = document.getElementById("areaIndicator")
    const directValue = sizeIndicator.querySelectorAll(".directValue")
    const pixelValue = sizeIndicator.querySelectorAll(".pixelValue")
    for (let i = 0; i < directValue.length; i++) {
        const element = directValue[i];
        element.innerText = newSize
    }

    for (let i = 0; i < pixelValue.length; i++) {
        const element = pixelValue[i];
        element.innerText = pixelSize
    }

    const areaElement = document.querySelector(".area")
    const mapEquiElement = document.querySelector(".mapEqui")
    const areaValue = pixelSize ** 2
    const mapEquiValue = newSize ** 2
    areaElement.innerText = areaValue
    mapEquiElement.innerText = mapEquiValue
    localStorage.setItem("filesAmount", JSON.stringify(mapEquiValue))


    canvas.width = pixelSize
    canvasResult.width = pixelSize
    canvas.height = pixelSize
    canvasResult.height = pixelSize
    sizeValue = pixelSize
}

async function fetchHeaders(image) {
    const responseHeaders = await fetch("/ressources/headers")
    const responseEOF = await fetch("/ressources/EOF.txt")
    const responseHTU = await fetch("/ressources/howToUse.txt")
    const responsePackmeta = await fetch("/ressources/packmeta.txt")
    const headers = await responseHeaders.text()
    const htu = await responseHTU.text()
    const EOF = await responseEOF.text()
    const packmeta = await responsePackmeta.text()
    GlobalComplements = [headers, EOF, htu, packmeta]
    toCanvas(image, sizeValue)
}



async function toCanvas(image, size) {
console.time("test")

    ctx.drawImage(image, 0, 0, size, size);
    let counter = 0
    for (let offsetY = 0; offsetY < size; offsetY = offsetY + 128) {
        for (let offsetX = 0; offsetX < size; offsetX = offsetX + 128) {
            const imgData = ctx.getImageData(offsetX, offsetY, 128, 128)
            workersCall([imgData, GlobalComplements, counter], [offsetX, offsetY])
            counter++
        }
    }
    console.timeEnd("test")    
}



const links = []
function workersCall(parametters, offsets) {
    const worker = new Worker("/lib/generateMapFile.js", {type:"module"})
    worker.postMessage(parametters)
    worker.onmessage = async(e) => {
        const mapLink = await createLink(e.data[0])
        links[e.data[1]] = mapLink
        console.log(links)
        let full = true
        const filesAmount = JSON.parse(localStorage.getItem("filesAmount"))
        console.log(filesAmount)
        for (let i = 0; i < filesAmount; i++) {
            if(!links[i]){
                full = false
            }
        }
        if(full === true){
            createZipFile(links)
        }
        console.log(e.data[1])
        ctxResult.putImageData(e.data[1], offsets[0], offsets[1])
    }
}


async function createLink(data) {
    const byteArray = new myTextEncoder().encode(data)
    const cs = new CompressionStream("gzip")
    const writer = cs.writable.getWriter()
    writer.write(byteArray)
    writer.close()
    const buffer = await new Response(cs.readable).arrayBuffer()
    const finalData = convertToAscii(new Uint8Array(buffer), false)
    const base64String = btoa(finalData.join(""))

    return base64String

}



function createZipFile(link) {
    const zipFile = new JSZip()
    zipFile.file("How to use it.txt", GlobalComplements[2])
    const commands = []
    for (let i = 0; i < link.length; i++) {
        zipFile.file(`map_${i}.dat`, link[i], { base64: true })
        commands.push(`give @s minecraft:filled_map[minecraft:map_id=${i}]`)
    }
    const datapack = zipFile.folder("datapack")
    datapack.file("pack.mcmeta", GlobalComplements[3])
    const data = datapack.folder("data")
    const mapGiver = data.folder("map_giver")
    const functions = mapGiver.folder("function")


    functions.file("give_maps.mcfunction", commands.join("\n"))
    zipFile.file("command.txt", "/function map_giver:give_maps")
    zipFile.generateAsync({ type: "base64" }).then((content) => {
        const link = document.createElement("a")
        link.href = "data:application/zip;base64," + content
        link.download = "zipFile.zip"
        link.innerText = "download zip"
        document.body.append(link)
    })
}