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