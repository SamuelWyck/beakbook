function eleFromPoint(x, y, identifier) {
    const elements = document.elementsFromPoint(x, y);

    let target = null;
    for (let element of elements) {
        if (element.matches(identifier)) {
            target = element;
            break;
        }
    }

    return target;
};



export default eleFromPoint;