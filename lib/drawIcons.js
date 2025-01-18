async function fetchIcons(name = ""){
   const response = await fetch(`/assets/${name}`)
   return await response.text()
}


async function appendInElement(classElement = ""){
    const icon = await fetchIcons(`${classElement}.svg`)
    const elements = document.querySelectorAll(`.${classElement}`)
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.innerHTML = icon
    }
}

function drawIcons(iconsName){

    for (let i = 0; i < iconsName.length; i++) {
        const element = iconsName[i];
        appendInElement(element)
    }
}
export {drawIcons}