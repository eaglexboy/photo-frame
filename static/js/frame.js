/**
 *  This function will make a background request to display the queue of photos currently loaded into the photo frame.
 *  The backend returns a list of media items that the user has selected.
 */
function loadQueue() {
    showLoadingDialog();
    getQueue()
    .then(data => {
        let parameters, photos;
        [parameters, photos] = data;
        // Queue has been loaded. Display the media items as a grid on screen.
        hideLoadingDialog();
        showPreview(parameters, photos);
        if(!isEmpty(photos)) {
            startGallery();
        }
        hideLoadingDialog();
        console.log('Loaded queue.');
    });
}

/**
 * This function will show a grid of media items in the photo frame.
 * The source is an object that describes how the items were loaded.
 * The media items are rendered on screen in a grid, with a caption based
 * on the description, model of the camera that took the photo and time stamp.
 * Each photo is displayed through the fancybox library for full screen and
 * caption support.
 * @param source The source of the media items to be used in the data grid
 * @param {MediaItem[]} mediaItems The media Items to add to the grid. (see [MediaItem]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#MediaItem} model)
 */
function showPreview(source, mediaItems) {
    getElements('#images-container').empty();

    // Display the length and the source of the items if set.
    if (!isEmpty(source) && !isEmpty(mediaItems)) {
        getElements('#images-count')[0].textContent = mediaItems.length;
        getElements('#images-source')[0].textContent = JSON.stringify(source);
        getElements('#preview-description').show();
    } else {
        getElements('#images-count')[0].textContent = '0';
        getElements('#images-source')[0].textContent = 'No photo search selected';
        getElements('#preview-description').hide();
    }

    // Show an error message and disable the slideshow button if no items are
    // loaded.
    if (isEmpty(mediaItems)) {
        getElements('#images_empty').show();
        getElements('#startSlideshow').disableElement();
    } else {
        getElements('#images_empty').hide();
        getElements('startSlideshow').removeClass('disabled');
    }

    const imageContainer = getElements('#images-container')[0]
    // Loop over each media item and render it.
    mediaItems.forEach((item, index) => {
        // Construct a thumbnail URL from the item's base URL at a small pixel size.
        const thumbnailUrl = `${item.baseUrl}=w256-h256`;
        // Construct the URL to the image in its original size based on its width and
        // height.
        const fullUrl = `${item.baseUrl}=w${item.mediaMetadata.width}-h${
            item.mediaMetadata.height}`;

        // Compile the caption, conisting of the description, model and time.
        const description = item.description ? item.description : '';
        const model = item.mediaMetadata?.photo?.cameraModel ?
            `#Shot on ${item.mediaMetadata.photo.cameraModel}` :
            '';
        const time = item.mediaMetadata.creationTime;
        const captionText = `${description} ${model} (${time})`

        // Each image is wrapped by a link for the Photo Swipe Gallery.
        // The data-width and data-height attributes are set to the
        // height and width of the original image. This allows the
        // Photo Swipe library to display a scaled up thumbnail while the
        // full sized image is being loaded.
        // The original width and height are part of the mediaMetadata of
        // an image media item from the API.
        const figureElement = document.createElement('figure');

        const linkToFullImage = document.createElement('a');
        linkToFullImage.setAttribute('href', fullUrl);
        linkToFullImage.addClass('pswp-link')
        linkToFullImage.dataset.id = index.toString();
        linkToFullImage.dataset.width = item.mediaMetadata.width;
        linkToFullImage.dataset.height = item.mediaMetadata.height;
        linkToFullImage.dataset.thumbnailSrc = thumbnailUrl;


        // Add the thumbnail image to the link to the full image for PhotoSwipe.
        const thumbnailImage = document.createElement('img');
        thumbnailImage.setAttribute('src', thumbnailUrl)
        thumbnailImage.setAttribute('alt', captionText)
        thumbnailImage.addClass('img-fluid rounded');
        linkToFullImage.append(thumbnailImage);

        // The caption consists of the caption text and a link to open the image
        // in Google Photos.
        const imageCaption = document.createElement('figcaption');
        imageCaption.addClass('hidden');
        imageCaption.textContent = captionText;
        const linkToGooglePhotos = document.createElement('a');
        linkToGooglePhotos.setAttribute('href', item.productUrl);
        linkToGooglePhotos.textContent = '[Click to open in Google Photos]';
        imageCaption.append(document.createElement('br'));
        imageCaption.append(linkToGooglePhotos);
        linkToFullImage.append(imageCaption);

        figureElement.append(linkToFullImage);

        // Add the link (consisting of the thumbnail image and caption) to
        // container.
        imageContainer.append(figureElement);
    });
}

function startGallery(){
    let container;
    // Init empty gallery array
    container = [];

    const imageContainer = getElements('#images-container')[0]
    const figures = getElements('figure', imageContainer)
    figures.forEach(figure => {
        let links = getElements('a', figure);
        links.forEach(link => {
            let images = getElements('img', link);
            if(!isEmpty(images)) {
                container.push({
                    id: link.dataset.id,
                    srcset: images[0],
                    src: link.getAttribute('href'),
                    width: link.dataset.width,
                    height: link.dataset.height,
                    alt: getElements('figcaption', link)[0]
                });
            }
        });

    });

    window.pswpLightbox.options.gallery = imageContainer;
    window.pswpLightbox.options.children = 'a.pswp-link';
    window.pswpLightbox.options.dataSource = container;

    window.pswpLightbox.addFilter('domItemData', (itemData, element, linkEl) => {
        itemData.src = linkEl.href;
        itemData.w = Number(linkEl.dataset.width);
        itemData.h = Number(linkEl.dataset.height);
        itemData.msrc = linkEl.dataset.thumbnailSrc;
        itemData.thumbCropped = true;

        return itemData;
    });
    window.pswpLightbox.init();
}