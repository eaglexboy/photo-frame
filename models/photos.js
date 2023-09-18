import {convertToJSON, initField, isModelEmpty} from "./models-core.js";
import {defaultTransformer} from "./transformers.js";

/**
 * These models are based on Google's Photo REST API Model
 */


// Classes are in dependency order (all decency classes are declared first) as classes are not
// hoisted and declaration order matters.

/**
 * [Photo]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#Photo}
 */
class Photo{
    constructor(photo) {
        this.keys = [
            'cameraMake',
            'cameraModel',
            'focalLength',
            'apertureFNumber',
            'isoEquivalent',
            'exposureTime'
        ];
        initField(this, 'cameraMake', photo);
        initField(this, 'cameraModel', photo);
        initField(this, 'focalLength', photo);
        initField(this, 'apertureFNumber', photo);
        initField(this, 'isoEquivalent', photo);
        initField(this, 'exposureTime', photo);
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

/**
 * [VideoProcessingStatus]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#VideoProcessingStatus}
 */
export const VIDEO_PROCESSING_STATUS = {
    UNSPECIFIED: 'UNSPECIFIED',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    FAILED: 'FAILED'
};

/**
 * [Video]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#Video}
 */
class Video{
    constructor(video) {
        this.keys = [
            'cameraMake',
            'cameraModel',
            'fps',
            'status'
        ];
        initField(this, 'cameraMake', video);
        initField(this, 'cameraModel', video);
        initField(this, 'fps', video);
        initField(this, 'status', video); // Enum VIDEO_PROCESSING_STATUS
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

/**
 * [MediaMetadata]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#MediaMetadata}
 */
class MediaMetadata{
    constructor(mediaMetadata) {
        this.keys = [
            'creationTime',
            'width',
            'height',
            'photo',
            'video'
        ];
        initField(this, 'creationTime', mediaMetadata);
        initField(this, 'width', mediaMetadata);
        initField(this, 'height', mediaMetadata);
        initField(this, 'photo', mediaMetadata, null, defaultTransformer(Photo));
        initField(this, 'video', mediaMetadata, null, defaultTransformer(Video));
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }

    hasFailedProcessing(){
        return this.video?.status === VIDEO_PROCESSING_STATUS.FAILED;
    }

    isProcessing(){
        return this.video?.status === VIDEO_PROCESSING_STATUS.PROCESSING;
    }
}

/**
 * [SharedAlbumOptions]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#ContributorInfo}
 */
class ContributorInfo{
    constructor(contributorInfo) {
        this.keys = [
            'profilePictureBaseUrl',
            'displayName'
        ];
        initField(this, 'profilePictureBaseUrl', contributorInfo);
        initField(this, 'displayName', contributorInfo);
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

const MediaType = {
    VIDEO: 'video',
    PICTURE: 'image'
};

/**
 * [MediaItem]{@link https://developers.google.com/photos/library/reference/rest/v1/mediaItems#MediaItem} model
 */
export class MediaItem{
    constructor(mediaItems) {
        this.keys = [
            'id',
            'description',
            'productUrl',
            'baseUrl',
            'mimeType',
            'mediaMetadata',
            'contributorInfo',
            'filename'
        ];
        initField(this, 'id', mediaItems);
        initField(this, 'description', mediaItems);
        initField(this, 'productUrl', mediaItems);
        initField(this, 'baseUrl', mediaItems);
        initField(this, 'mimeType', mediaItems);
        initField(this, 'mediaMetadata', mediaItems, null, defaultTransformer(MediaMetadata));
        initField(this, 'contributorInfo', mediaItems, null, defaultTransformer(ContributorInfo));
        initField(this, 'filename', mediaItems);

        if(this.mimeType.startsWith(MediaType.VIDEO)){
            this.mediaType = MediaType.VIDEO
        }
        else {
            this.mediaType = MediaType.PICTURE
        }
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    isPicture(){
        return this.mediaType === MediaType.PICTURE;
    }

    isVideo(){
        return this.mediaType === MediaType.VIDEO;
    }

    hasFailedProcessing(){
        if(this.isVideo()){
            return this.mediaMetadata.hasFailedProcessing();
        }

        return null;
    }

    isProcessing(){
        if(this.isVideo()){
            return this.mediaMetadata.isProcessing();
        }

        return null;
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

export class MediaItemSearch{
    constructor(mediaItemSearch) {
        this.keys = [
            'mediaItems',
            'nextPageToken'
        ];
        initField(this, 'mediaItems', mediaItemSearch, [], null, defaultTransformer(MediaItem));
        initField(this, 'nextPageToken', mediaItemSearch);
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}