/** Array Prototypes **/
if(isUndefinedOrNull(Array.prototype.includesIgnoreCase)){
    Array.prototype.includesIgnoreCase = function(stringToSearch, trim = false){
        for (const value of this) {
            let valueToUse = trim === true ? value.trim() : value;
            if(valueToUse.equalsIgnoreCase(stringToSearch)){
                return true;
            }
        }

        return false;
    };
}

/** Prototypes for Element **/

// Prototype to emulate jQuery "addClass"
if(isUndefinedOrNull(Element.prototype.addClass)){
    Element.prototype.addClass = function(classToAdd){
        addClassToElement(this, classToAdd);
    }
}

// Prototype to disable Element
Element.prototype.disableElement = function (){
    disableElements(this);
}

// Prototype to emulate jQuery "empty"
if(isUndefinedOrNull(Element.prototype.empty)){
    Element.prototype.empty = function () {
        emptyElement(this)
    }
}

// Prototype to disable Element
Element.prototype.enableElement = function (){
    enableElements(this);
}

// Prototype to Emulate jQuery "forEach" against node
Element.prototype.forEach = function (callback){
    callback(this);
}

// Prototype to emulate jQuery "hide"
if(isUndefinedOrNull(Element.prototype.hide)){
    Element.prototype.hide = function(){
        hideElement(this);
    };
}

// Prototype to emulate jQuery "on"
if(isUndefinedOrNull(Element.prototype.on)){
    Element.prototype.on = function(events, callback, selector){
        if(!isEmpty(selector)){
            getElements(selector, this).forEach(element => {
                element.on(events, callback);
            })
        }
        else {
            if (!isUndefinedOrNull(events)) {
                events = events.split(' ');
                for (const event of events) {
                    this.addEventListener(event, callback);
                }
            }
        }
    };
}

// Prototype to emulate jQuery "removeClass"
if(isUndefinedOrNull(Element.prototype.removeClass)){
    Element.prototype.removeClass = function(classToRemove){
        removeClassFromElement(this, classToRemove);
    }
}

Element.prototype.removeFromParent = function () {
    this.parentElement?.removeChild(this);
};

// Prototype to emulate jQuery "show"
if(isUndefinedOrNull(Element.prototype.show)){
    Element.prototype.show = function(){
        showElements(this);
    }
}


/** Prototypes for NodeList **/

// Prototype to emulate jQuery "addClass"
if(isUndefinedOrNull(NodeList.prototype.addClass)){
    NodeList.prototype.addClass = function(classToAdd){
        this.forEach(element => element.addClass(classToAdd));
    }
}

// Prototype to disable Element
NodeList.prototype.disableElement = function (){
    disableElements(this);
}

// Prototype to emulate jQuery "empty"
if(isUndefinedOrNull(NodeList.prototype.empty)){
    NodeList.prototype.empty = function() {
        this.forEach(el => el.empty());
    }
}

// Prototype to disable Element
NodeList.prototype.enableElement = function (){
    enableElements(this);
}

// Prototype to emulate jQuery "hide"
if(isUndefinedOrNull(NodeList.prototype.hide)){
    NodeList.prototype.hide = function(){
        this.forEach(element => element.hide());
    };
}

// Prototype to emulate jQuery "on"
if(isUndefinedOrNull(NodeList.prototype.on)){
    NodeList.prototype.on = function(events, callback, selector){
        if(!isUndefinedOrNull(events)){
            for(const el of this){
                el.on(events, callback, selector);
            }
        }
    };
}

// Prototype to emulate jQuery "removeClass"
if(isUndefinedOrNull(NodeList.prototype.removeClass)){
    NodeList.prototype.removeClass = function(classToRemove){
        this.forEach(e => e.removeClass(classToRemove));
    }
}

// Prototype to emulate jQuery "show"
if(isUndefinedOrNull(NodeList.prototype.show)){
    NodeList.prototype.show = function(){
        this.forEach(el => el.show());
    }
}



/** String Prototypes **/
// Prototype to compare strings case-insensitive
if(isUndefinedOrNull(String.prototype.equalsIgnoreCase)) {
    String.prototype.equalsIgnoreCase = function (compareString) {
        return this?.toLowerCase() === compareString?.toLowerCase();
    };
}

// Prototype to perform case-insensitive includes
if(isUndefinedOrNull(String.prototype.includesIgnoreCase)) {
    String.prototype.includesIgnoreCase = function (compareString) {
        // Is compareString null or undefined, then they are not the same
        if(isUndefinedOrNull(compareString)){
            return false;
        }

        return this.toLowerCase().includes(compareString.toLowerCase());
    };
}