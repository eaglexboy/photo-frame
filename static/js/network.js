
/**
 * This function will call the endpoint to get the Albums for the user
 * @returns {Promise<Album[]>}
 */
function getAlbums(){
    return fetch(
        '/getAlbums',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }
    ).then(async response => {
        if(!response.ok){
            hideLoadingDialog();
            await handleError('Couldn\'t load albums', response);
            return;
        }

        let data = await response.json();
        return data.albums;
    }).catch(async error => {
        hideLoadingDialog();
        await handleError('Couldn\'t load albums', error);
    });
}

/**
 * This function will call the Photo Queue Endpoint and return the Selected Album Data
 * @param {Number} [photosToLoad] Number of photos to return
 * @returns {Promise<[Object, MediaItem[]]>} Returns Parameters and Pictures in album (see
 * [MediaItem]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#MediaItem} model)
 */
async function getQueue(photosToLoad){
    try {
        let response = await fetch(
            '/getQueue' + (!isEmpty(photosToLoad) ? 'photosToLoad=' + photosToLoad : ''),
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        if (!response.ok) {
            await handleError('Could not load queue', response);
            return [];
        }

        let data = await response.json();

        return [data.parameters || {}, data.photos || []];
    }
    catch(error) {
        hideLoadingDialog();
        await handleError('Could not load queue', error);
    }
}

/**
 * This function will handle any errors received during a fetch call
 * @param {String} title Title to show for the Error Message
 * @param {String|Object} data Error Data
 */
async function handleError(title, data) {
    if(typeof data == 'object' && !(data instanceof Error)){
        let json = null;
        const body = await data.text();
        console.log('Error: ' + body);

        try{
            json = JSON.parse(body);
        }
        catch (ignored){
            // Not JSON response
        }


        if (data.status === 401) {
            // Authentication error. Redirect back to the log in screen.
            window.location = '/logout';
        } else if (data.status === 0) {
            // Server could not be reached from the request.
            // It could be blocked, unavailable or unresponsive.
            showError(title, 'Server could not be reached. Please try again.');
        } else if (json) {
            // JSON error that can be formatted.
            showJsonError(title, json);
        } else {
            // Otherwise, display the data returned by the request.
            showError(title, body);
        }
    }
    else if(data instanceof Error){
        showError(title, data.message);
    }
    else {
        showError(title, data);
    }

    hideLoadingDialog();
}

async function getFromAlbum(albumId){
    try {
        let response = await fetch(
            '/loadFromAlbum',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    albumId: albumId,
                    photosToLoad: -1
                })
            }
        )

        if (!response.ok) {
            await handleError('Couldn\'t import album', response);
            return;
        }

        let data = await response.json();
        return data;
    }
    catch(error){
        await handleError('Couldn\'t import album', error);
    }
}

/**
 * This function shows an error with a title and text. Scrolls the screen to show the error.
 * @param {String} title Title to use for the Error Message
 * @param {String} text Text to show for the Error Message
 */
function showError(title, text) {
    // Hide the loading dialog, just in case it is still being displayed.
    hideLoadingDialog();

    getElements('#errorTitle')[0].textContent = title;
    getElements('#errorMessage')[0].textContent = text;
    getElements('#error').show();

    // Scroll to show the error message on screen.
    const error = getElements('#error')[0];
    getElements('html,body').forEach(element => {
        element.style.position = 'absolute';
        element.animate(
            {
                scrollTop: error.offsetTop
            },
            {
                duration: 300,
                easing: 'ease-in-out',
                iterations: 1,
            });
    });
}

/**
 * This function shows an error with a title and a JSON object that is pretty printed.
 * @param {String} title Title to use for the Error Message
 * @param {Object} json JSON payload to serialize
 */
function showJsonError(title, json) {
    showError(title, JSON.stringify(json, null, 2));
}