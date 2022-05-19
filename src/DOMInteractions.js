const _getDOMElem = (attribute, value) => {
    return document.querySelector(`[${attribute}="${value}"]`);
}

export const mapListToDOMElements = (listOfValues, attribute) => {
    const _viewElems = {};
    
    for (const value of listOfValues) {
        _viewElems[value] = _getDOMElem(attribute, value);
    }

    return _viewElems;
}

export const createDOMElem = (tagName, className, innerText, src) => {
    const tag = document.createElement(tagName);
    tag.classList = className;

    if (innerText) tag.innerText = innerText;

    if (src) tag.src = src;

    return tag;
}
