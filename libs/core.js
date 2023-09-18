/**
 * This method determines if the provided values is of Boolean type
 * @param {boolean|string} potentialBoolean Object to check if it's Boolean
 * @return {boolean} outcome of check
 */
export const isBoolean = (potentialBoolean) => {
    return (
        typeof potentialBoolean === 'boolean'
        || potentialBoolean.equalsIgnoreCase('true')
        || potentialBoolean.equalsIgnoreCase('false')
    );
};

/**
 * This method will determine if the provided object is Undefined, Null or Empty
 * @param {*} obj Object to check if empty
 * @param {boolean} [trim=false] trim string value
 * @return {boolean} outcome of check
 */
export const isEmpty = (obj, trim = false) => {
    if(isUndefinedOrNull(obj)){
        return true;
    }

    // Empty Array
    if(Array.isArray(obj)){
        return obj.length === 0;
    }

    if(trim && typeof obj === 'string'){
        obj = obj.trim();
    }

    //      Regular Object with no properties
    return (Object.entries(obj).length === 0 && obj.constructor === Object)
        // Object with property of length and set to 0
        || (typeof obj === 'object' && obj.hasOwnProperty('length') && obj.length === 0)
        // Object with property of isEmpty and set to 0
        || (typeof obj === 'object' && isFunction(obj.isEmpty) && obj.isEmpty())
        || obj === '';
};

/**
 * This method will determine if the provided object is a Function
 * @param {*} obj Object to check if it is a function
 * @return {boolean} outcome of check
 */
export const isFunction = (obj) => {
    return !isUndefinedOrNull(obj) && typeof obj === 'function'
};

/**
 * This method will check if the provided object is Undefined or Null
 * @param {*} obj Object to check if Undefined or Null
 * @return {boolean} outcome of check
 */
export const isUndefinedOrNull = (obj) => {
    return obj === undefined || obj === null;
};

/**
 * This method will check if the provided value is Undefined or Null and if so return the default value
 * @param self
 * @param defaultValue
 * @return {*}
 */
export const selfOrDefault = (self, defaultValue) => {
    if(isUndefinedOrNull(self)){
        return defaultValue;
    }

    return self;
};

/**
 * This method will check if the object provided is a Boolean and return the Boolean value or return false
 * @param {*} booleanString Value to convert to Boolean
 * @return {boolean}
 */
export const toBoolean = (booleanString) => {
    if(isUndefinedOrNull(booleanString)){
        return false;
    }

    if(isBoolean(booleanString) && typeof booleanString !== 'string'){
        return booleanString;
    }

    return booleanString.toLowerCase() === 'true';
};