/**
 * This function will execute the provided callback when the Document has a Ready State
 * @param {Function} callback Callback function to execute on Ready State
 */
function onDocReady(callback){
    if(document.readyState !== "loading"){
        callback();
    }
    else{
        document.addEventListener("DOMContentLoaded", callback);
    }
}