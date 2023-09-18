/**
 * Loads a list of all albums owned by the logged-in user from the backend. The backend returns a list of albums from
 * the Library API that is rendered here in a list with a cover image, title and a link to open it in Google Photos.
 */
function listAlbums() {
    getElements('#error').show();
    showLoadingDialog();
    getElements('#albums').empty();

    return getAlbums()
    .then(albums => {
        console.log('Loaded albums: ' + albums);
        // Render each album from the backend in its own row, consisting of
        // title, cover image, number of items, link to Google Photos and a
        // button to add it to the photo frame.
        // The items rendered here are albums that are returned from the
        // Library API.
        albums.forEach((item ) => {
            // Load the cover photo as a 100x100px thumbnail.
            // It is a base url, so the height and width parameter must be appended.
            const thumbnailUrl = `${item.coverPhotoBaseUrl}=w100-h100`;

            // Set up a Material Design Lite list.
            const materialDesignLiteList = document.createElement('li');
            materialDesignLiteList.addClass('mdl-list__item mdl-list__item--two-line');

            // Create the primary content for this list item.
            const primaryContentRoot = document.createElement('div');
            primaryContentRoot.addClass('mdl-list__item-primary-content');
            materialDesignLiteList.append(primaryContentRoot);

            // The image showing the album thumbnail.
            const primaryContentImage = document.createElement('img');
            primaryContentImage.setAttribute('src', thumbnailUrl);
            primaryContentImage.setAttribute('alt', item.title);
            primaryContentImage.addClass('mdl-list__item-avatar');
            primaryContentRoot.append(primaryContentImage);

            // The title of the album as the primary title of this item.
            const primaryContentTitle = document.createElement('div');
            primaryContentTitle.textContent = item.title;
            primaryContentRoot.append(primaryContentTitle);

            // The number of items of this album as the sub-title.
            const primaryContentSubTitle = document.createElement('div');
            primaryContentSubTitle.textContent = `(${item.mediaItemsCount} items)`;
            primaryContentSubTitle.addClass('mdl-list__item-sub-title');
            primaryContentRoot.append(primaryContentSubTitle);

            // Secondary content consists of two links with buttons.
            const secondaryContentRoot = document.createElement('div');
            secondaryContentRoot.addClass('mdl-list__item-secondary-action');
            materialDesignLiteList.append(secondaryContentRoot);


            // The 'add to photo frame' link.
            const linkToAddToPhotoFrame = document.createElement('a');
            linkToAddToPhotoFrame.addClass('album-title');
            linkToAddToPhotoFrame.dataset.id = item.id;
            linkToAddToPhotoFrame.dataset.title = item.title;
            secondaryContentRoot.append(linkToAddToPhotoFrame);

            // The button for the 'add to photo frame' link.
            const addToPhotoFrameButton = document.createElement('button');
            addToPhotoFrameButton.addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--accent');
            addToPhotoFrameButton.textContent = 'Add to frame';
            linkToAddToPhotoFrame.append(addToPhotoFrameButton);

            // The 'open in Google Photos' link.
            const linkToGooglePhotos = document.createElement('a');
            linkToGooglePhotos.setAttribute('target', '_blank');
            linkToGooglePhotos.setAttribute('href', item.productUrl);
            secondaryContentRoot.append(linkToGooglePhotos);

            // The button for the 'open in Google Photos' link.
            const googlePhotosButton = document.createElement('button');
            googlePhotosButton.addClass('gp-button raised');
            googlePhotosButton.textContent = 'Open in Google Photos';
            linkToGooglePhotos.append(googlePhotosButton);

            // Add the list item to the list of albums.
            getElements('#albums')[0].append(materialDesignLiteList);
        });

        hideLoadingDialog();
        console.log('Albums loaded.');
    });
}

/**
 * Notifies the backend to load an album into the photo frame queue.
 * If the request is successful, the photo frame queue is opened, otherwise an error message is shown.
 * @param {String} name Album Name
 * @param {String} id Album Id
 */
function loadFromAlbum(name, id) {
    showLoadingDialog();
    // Make an ajax request to the backend to load from an album.
    getFromAlbum(id)
        .then(async data => {
            console.log('Albums imported:' + JSON.stringify(data.parameters));
            if (!isEmpty(data?.photos)) {
                // Photos were loaded from the album, open the photo frame preview queue.
                window.location = '/';
            } else {
                // No photos were loaded. Display an error.
                await handleError('Couldn\'t import album', 'Album is empty.');
            }
            hideLoadingDialog();
        }).catch(async data => {
        await handleError('Couldn\'t import album', data);
    });
}