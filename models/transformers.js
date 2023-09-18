import {
    isUndefinedOrNull,
    toBoolean
} from "../libs/core.js";

/**
 * Will Transform provided value to a boolean
 * @returns {function(*): boolean|*}
 */
export const booleanTransformer = () => {
    return (potentialBoolean) => toBoolean(potentialBoolean)
};

/**
 * This is a default transformer to transform an object to a Model
 * @param {*} clazz Class to transform source into
 * @return {function(object): *}
 */
export let defaultTransformer = (clazz) =>{
    return (source) => {
        return new clazz(source);
    }
};

/**
 * This is the default transformer for source values that are list
 * @return {function(*=): *|*[]}
 */
export const defaultListTransformer = () => {
    return (list) => { return !isUndefinedOrNull(list) ? list : [] }
};

/**
 * This is an identify transformer to use to set values to source value
 * @return {function(*): *}
 */
export const identityTransformer = () => {
    return (value) => value;
};