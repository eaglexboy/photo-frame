import {
    isEmpty,
    isFunction,
    isUndefinedOrNull,
    selfOrDefault
} from '../libs/core.js';

/**
 * This method will convert the provided Model to JSON Object. This method expect to be bound to a
 * Model.
 * @param {boolean} [removeNull=true] Should fields that are null be removed
 * @return {object}
 */
export function convertToJSON(removeNull = true) {
    let jsonObject = {};
    const skipFields = [
        '_isEmpty',
        '_name',
        '_parent',
        'aliases',
        'errors',
        'keys',
    ];

    // Make sure the aliases object is present
    this.aliases = this.aliases || {};

    // build json Object
    for(const key in this){
        let keyToUse = this.aliases[key] || key;

        // Field to Skip?
        if(skipFields.includes(key)){
            continue;
        }

        let valueToSet = getJsonObject(this[key]);
        if(Array.isArray(valueToSet)){
            jsonObject[keyToUse] = [];
            for(let element of valueToSet){
                let value = getJsonObject(element);
                if(!isUndefinedOrNull(value)) {
                    jsonObject[keyToUse].push(value);
                }
            }
        }
        else {
            if(!removeNull || (removeNull && !isUndefinedOrNull(valueToSet))) {
                jsonObject[keyToUse] = valueToSet;
            }
        }
    }

    return whatToReturn(removeNull, jsonObject);
}

/**
 * This method will retrieve the provided Model to JSON object if the Model has a <b>"toJson"</b>
 * method.<br>
 * Returns model if <b>"toJson"</b> is not found
 * @param {object} objToConvert Model to call JSON converter
 * @return {object} JSON object or Model
 */
export const getJsonObject = (objToConvert) => {
    if(
        !isUndefinedOrNull(objToConvert)
        && !isUndefinedOrNull(objToConvert.toJson)
        && isFunction(objToConvert.toJson)
    ){
        return  objToConvert.toJson();
    }

    return objToConvert;
};

/**
 * This method will initialize a field in the provided model
 * @param {object} obj Model to initialize field in
 * @param {String} key Name of the field to initialize
 * @param {object} source source to read value of field
 * @param {*} [defaultValue] value to default if missing in source
 * @param {function} [transformer] Transformer to use to convert source value
 * @param {function} [processor] Processor to use to process source value before assigning it to Model
 * @param {String} [alias] Alias to use for field if source does not have the key provided
 */
export let initField = (obj, key, source, defaultValue, transformer, processor, alias) => {
    if(defaultValue === undefined){
        defaultValue = null;
    }

    if(isUndefinedOrNull(alias)){
        alias = key;
    }
    else{
        // Store Aliases in object
        obj.aliases = obj.aliases || {};
        obj.aliases[key] = alias;
    }

    if(isEmpty(source)){
        obj[key] = defaultValue;
    }
    else{
        if(isUndefinedOrNull(processor)){
            obj[key] = transform(transformer, source, alias, key, defaultValue);
        }
        else{
            // Source is a list and we need to process each element
            obj[key] = selfOrDefault(defaultValue, []);
            let listToUse = selfOrDefault(source[alias], source[key]);
            if(!isUndefinedOrNull(listToUse)){
                for(const value of listToUse){
                    let returnValue = processElement(processor, value);
                    if(!isUndefinedOrNull(returnValue)) {
                        obj[key].push(returnValue);
                    }
                }
            }
        }
    }

    // Did we set the value to an Object.
    if(!isUndefinedOrNull(obj[key]) && typeof obj[key] === 'object'){
        // Bind child object to Parent
        obj[key]._parent = obj;
        obj[key]._name = alias;

        // Fire Post Construct method if present
        if(isFunction(obj[key].postConstruct)){
            obj[key].postConstruct()
        }
    }
};

export function isModelEmpty(){
    if(isEmpty(this.keys)){
        return false;
    }

    for(const key of this.keys){
        if(!isEmpty(this[key])){
            return false;
        }
    }

    return true;
}

/**
 * This method will process the source value using the provided processor
 * @param {function} processor Processor to use
 * @param {*} value Source value to use for processing
 * @return {null|*} Processed value
 */
const processElement = (processor, value) => {
    let returnValue = processor(value);
    if(
        !isUndefinedOrNull(returnValue)
        && (
            typeof returnValue !== 'object'
            || (
                typeof returnValue === 'object'
                && (
                    isUndefinedOrNull(returnValue.isValid)
                    || returnValue.isValid()
                )
            )
        )
    ) {
        return returnValue;
    }

    return null;
}

/**
 * This method will transform the source value using the provided transformer
 * @param {function} transformer Transformer to use
 * @param {object} source Source to retrieve value from
 * @param {String} alias Field source alias to use if key is missing
 * @param {String} key Field key to store in model and retrieve from source
 * @param {*|null} defaultValue Default value to use if value missing from source
 * @return {*|null}
 */
const transform = (transformer, source, alias, key, defaultValue) => {
    let valueToUse;
    if (isFunction(transformer)) {
        // Get Alias or Key if Alias is missing
        valueToUse = selfOrDefault(source[alias], source[key]);
        valueToUse = transformer(valueToUse);
    } else {
        if (!isUndefinedOrNull(source[alias])) {
            valueToUse = source[alias];
        } else if (!isUndefinedOrNull(source[key])) {
            valueToUse = source[key];
        }

        valueToUse = selfOrDefault(valueToUse, defaultValue);
    }

    return valueToUse;
}

/**
 * This method will determine what values to return from the JSON Object based on the provided flag
 * @param {boolean} removeNull Flog to indicate if null values should be removed
 * @param {object} jsonObject JSON Object to analyze
 * @return {*|null} Cleaned JSON Object
 */
const whatToReturn = (removeNull, jsonObject) => {
    if (removeNull && !Array.isArray(jsonObject)) {
        return !isEmpty(jsonObject) ? jsonObject : null
    } else {
        return jsonObject;
    }
};