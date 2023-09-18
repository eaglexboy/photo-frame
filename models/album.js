import {
    convertToJSON,
    initField, isModelEmpty
} from "./models-core.js";
import {
    booleanTransformer,
    defaultTransformer
} from "./transformers.js";

/**
 * These models are based on Google's Photo REST API Model
 */


// Classes are in dependency order (all decency classes are declared first) as classes are not
// hoisted and declaration order matters.

/**
 * [SharedAlbumOptions]{@link https://developers.google.com/photos/library/reference/rest/v1/albums#Album.SharedAlbumOptions} model
 */
class SharedAlbumOptions{
    constructor(sharedAlbumOptions) {
        this.keys = [
            'isCollaborative',
            'isCommentable'
        ];
        initField(this, 'isCollaborative', sharedAlbumOptions, false, booleanTransformer());
        initField(this, 'isCommentable', sharedAlbumOptions, false, booleanTransformer());
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

/**
 * [ShareInfo] {@link https://developers.google.com/photos/library/reference/rest/v1/albums#Album.ShareInfo} model
 */
class ShareInfo{
    constructor(shareInfo) {
        this.keys = [
            'sharedAlbumOptions',
            'shareableUrl',
            'shareToken',
            'isJoined',
            'isOwned',
            'isJoinable'
        ];
        initField(this, 'sharedAlbumOptions', shareInfo, null, defaultTransformer(SharedAlbumOptions));
        initField(this, 'shareableUrl', shareInfo);
        initField(this, 'shareToken', shareInfo);
        initField(this, 'isJoined', shareInfo, false, booleanTransformer());
        initField(this, 'isOwned', shareInfo, false, booleanTransformer());
        initField(this, 'isJoinable', shareInfo, false, booleanTransformer());
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

/**
 * [Album]{@link https://developers.google.com/photos/library/reference/rest/v1/albums#Album} Model
 */
export class Album{
    constructor(album) {
        this.keys = [
            'id', 'title', 'productUrl', 'isWriteable', 'shareInfo', 'mediaItemsCount', 'coverPhotoBaseUrl',
            'coverPhotoMediaItemId'
        ];

        initField(this, 'id', album);
        initField(this, 'title', album);
        initField(this, 'productUrl', album);
        initField(this, 'isWriteable', album, false, booleanTransformer());
        initField(this, 'shareInfo', album, null, defaultTransformer(ShareInfo));
        initField(this, 'mediaItemsCount', album);
        initField(this, 'coverPhotoBaseUrl', album);
        initField(this, 'coverPhotoMediaItemId', album);
    }

    isEmpty(){
        return isModelEmpty.call(this);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}

export class AlbumResponse{
    constructor(albumResponse) {
        initField(this, 'albums', albumResponse, [], null, defaultTransformer(Album))
        initField(this, 'nextPageToken', albumResponse);
    }

    toJson(){
        return convertToJSON.call(this);
    }
}