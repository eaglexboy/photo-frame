/**
 * This function will add the provided class(es) to the Element/NodeList
 * @param {String|Element|NodeList} elements Elements to remove Class from
 * @param {String|String[]} classToAdd Class(es) to add. Can be an array or comma seperated or space seperated list
 */
function addClassToElement (elements, classToAdd) {
    let el;

    if(isEmpty(elements) || isEmpty(classToAdd)){
        return;
    }

    el = getElements(elements);
    el = elementToArray(el);

    classToAdd = splitClasses(classToAdd);
    el.forEach(element => element.classList.add(...classToAdd));
}

/**
 * Disabled the specified elements
 * @param {String|Element|NodeList} element element to disable;
 */
function disableElements (element) {
    let el = getElements(element);

    el = elementToArray(el);

    if(!isUndefinedOrNull(el)){
        el.forEach(e => e.disabled = true);
    }
}

/**
 * This function will check to see if the element is a Element or NodeList. If Element is provided it will return an
 * Array of Elements
 * @param {Element|NodeList} element Element to check
 * @returns {Element[]|NodeList} Array or NodeList
 */
function elementToArray(element){
    let output = element;
    if(element instanceof Element){
        output = [element];
    }

    return output;
}

/**
 * This function will empty the provided selector
 * @param {String|Element|NodeList} selector CSS Selector for the desired element
 */
function emptyElement(selector){
    let element = getElements(selector);

    if(element instanceof NodeList){
        emptyElements(element);
        return;
    }

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * This function will empty the provided selector
 * @param {String|Element|NodeList} selector CSS Selector for the desired element
 */
function emptyElements(selector){
    let el = getElements(selector);

    el = elementToArray(el);

    el.forEach(element => {
        emptyElement(element);
    });
}

/**
 * Enable the specified elements
 * @param {String|Element|NodeList} element element to enable;
 */
function enableElements (element) {
    let el = getElements(element);

    el = elementToArray(el);

    if(!isUndefinedOrNull(el)){
        el.forEach(e => e.disabled = false);
    }
}

/**
 * This function will return the NodeList that matches the CSS selector provided. Will return selector if selector is
 * Element or NodeList
 * @param {String|Element|NodeList} selector CSS Selector for the desired element
 * @param {Document|Element|NodeList} source Source to search for CSS Selector
 * @return {null|Element|Element[]|NodeList} DOM NodeList that matches the CSS Selector provided
 */
function getElements(selector, source = document){
    if (isUndefinedOrNull(selector)) {
        return null;
    }

    if (typeof selector === 'string') {
        if(source instanceof NodeList){
            let combined = []
            source.forEach(s =>{
               let n = s.querySelectorAll(selector);
               n.forEach(e => combined.push(e))
            });
            return combined;
        }
        return source.querySelectorAll(selector);
    } else if (selector instanceof Element || selector instanceof NodeList) {
        return selector;
    }

    // Should never reach here but just in case
    throw Error('selector provided is not valid');
}

/**
 * This function will hide the provided Element/NodeList provided
 * @param {Element|NodeList|String} elements CSS Selector, Element or NodeList to hide
 * @param {Boolean} [removeElementsSpace=true] Whether to hide or remove the Elements. Default is Remove
 */
function hideElement(elements, removeElementsSpace = true){
    let el = getElements(elements);

    el = elementToArray(el);

    if(!isUndefinedOrNull(el)){
        el.forEach(element => {
            if (getComputedStyle(element).display !== 'none') {
                element.dataset.xxxDisplay = getComputedStyle(element).display;
            }
            if(removeElementsSpace) {
                element.style.display = 'none';
            }
            else {
                element.style.visibility = 'hidden';
            }
        });
    }
}

/**
 * This function will hide the overlay loading dialog.
 */
function hideLoadingDialog() {
    getElements('.loading-dialog').hide();
}

/**
 * This function will remove the provided list of Classes from the provided Element(s)
 * @param {String|Element|NodeList} elements Elements to remove Class from
 * @param {String|String[]} classToRemove Class(es) to remove. Can be an array or comma seperated or space seperated list
 */
function removeClassFromElement(elements, classToRemove) {
    let el;

    if(isEmpty(elements) || isEmpty(classToRemove)){
        return;
    }

    el = getElements(elements);
    el = elementToArray(el);
    classToRemove = splitClasses(classToRemove);

    el.forEach(element => element.classList.remove(classToRemove))
}

/**
 * This function will show the provided Element/NodeList provided
 * @param {Element|NodeList|String} elements CSS Selector, Element or NodeList to hide
 */
function showElements(elements) {
    let el = getElements(elements);

    el = elementToArray(el);

    if(!isUndefinedOrNull(el)){
        el.forEach(element =>{
            if(getComputedStyle(element).visibility.equalsIgnoreCase('hidden')){
                element.style.visibility = 'visible';
            }
            else {
                if(getComputedStyle(element).display === 'none'){
                    element.style.display = element.dataset.xxxDisplay || 'block';
                }
            }
        });
    }
}

/**
 * Displays the overlay loading dialog.
 */
function showLoadingDialog() {
    getElements('.loading-dialog').show();
}

function splitClasses(classToSplit) {
    if (!Array.isArray(classToSplit)) {
        let separator = classToSplit.includes(' ') ? ' ' : ',';
        classToSplit = classToSplit.split(separator).map(c => c.trim()).filter(c => !isEmpty(c));
    }

    return classToSplit;
}