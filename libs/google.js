import session from 'express-session';
import fetch from 'node-fetch';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';
import {Strategy as GoogleOAuthStrategy} from 'passport-google-oauth20';
import {
	MediaItemCache,
	Storage
} from './cache.js';
import authenticationCredentials from '../configs/credentials.js';
import config from '../configs/google.js';
import {getLogger} from './logging.js';
import {isEmpty,
	selfOrDefault
} from "./core.js";
import {AlbumResponse} from "../models/album.js";
import {MediaItemSearch} from "../models/photos.js";

const logger = getLogger();

/**
 * This function will authenticate against Google OAuth
 */
export const auth = () => {
	passport.serializeUser((user, done) => done(null, user));
	passport.deserializeUser((user, done) => done(null, user));

	const strategy = new GoogleOAuthStrategy(
		{
			clientID: authenticationCredentials.oAuthClientID,
			clientSecret: authenticationCredentials.oAuthclientSecret,
			callbackURL: config.oAuthCallbackUrl,
		},
		(token, refreshToken, profile, done) => {
			// Save tokens in session API retrieval
			session.tokenInfo = {
				refreshToken: refreshToken,
				token: token
			};

			done(null, {profile, token, refreshToken})
		}
	);

	// Authentication
	passport.use(strategy);
	// Token Refresh
	refresh.use(strategy);
};

/**
 * Returns a list of all albums owner by the logged-in user from the Library API
 * @param user User to use for call
 * @returns {Promise<{albums: Album[], error: String}>} Response of Albums and Errors
 */
export async function libraryApiGetAlbums(user) {
	let albums, error, nextPageToken, parameters;
	albums = [];
	nextPageToken = null;
	error = null;

	parameters = new URLSearchParams();
	parameters.append('pageSize', config.albumPageSize);

	try {
		// Loop while there is a nextpageToken property in the response until all
		// albums have been listed.
		do {
			logger.verbose(`Loading albums. Received so far: ${albums.length}`);
			// Make a GET request to load the albums with optional parameters (the
			// pageToken if set).
			const data = await getFromGoogle(config.apiEndpoint + '/v1/albums?' + parameters);

			logger.debug(`Response: ${data}`);
			const albumResponsePayload = new AlbumResponse(data)

			if (!isEmpty(albumResponsePayload.albums)) {
				logger.verbose(`Number of albums received: ${albumResponsePayload.albums.length}`);
				// Parse albums and add them to the list, skipping empty entries.
				const items = albumResponsePayload.albums.filter(x => !x.isEmpty());

				albums = albums.concat(items);
			}
			if (albumResponsePayload.nextPageToken) {
				parameters.set('pageToken', albumResponsePayload.nextPageToken);
			} else {
				parameters.delete('pageToken');
			}

			// Loop until all albums have been listed and no new nextPageToken is
			// returned.
		} while (parameters.has('pageToken'));
	} catch (err) {
		// Log the error and prepare to return it.
		error = err;
		logger.error(error);
	}

	logger.info('Albums loaded.');
	albums = albums.map(album => album.toJson());
	return { albums, error };
}

/**
 * Submits a search request to the Google Photos Library API for the given parameters. The authToken is used to
 * authenticate requests for the API.
 * The minimum number of expected results is configured in config.photosToLoad.
 * This function makes multiple calls to the API to load at least as many photos as requested. This may result in more
 * items being listed in the response than originally requested.
 * @param {String} user Authentication token to use for calls
 * @param {Object} parameters Search parameters to use
 * @param {Boolean} [retryWithRefresh=false] Are we retrying with refreshed token (Default is false)
 * @returns {Promise<{error: String, photos: MediaItem[], parameters: Object}>}
 */
export async function libraryApiSearch(user, parameters, retryWithRefresh = false) {
	let error, nextPageToken, photos, photosToLoad, photosToLoadWasProvided;
	photos = [];
	nextPageToken = null;
	error = null;
	// Get photos to return and remove from paramater since this is not a parameter used by the API. "-1" means return
	// all. Missing or zero means default
	photosToLoadWasProvided = isEmpty(parameters.photosToLoad)
	photosToLoad = selfOrDefault(parameters.photosToLoad, config.photosToLoad);
	if(photosToLoad === 0){
		photosToLoad = config.photosToLoad;
	}
	delete parameters.photosToLoad;

	parameters.pageSize = config.searchPageSize;
	const url = config.apiEndpoint + '/v1/mediaItems:search'


	try {
		// Loop while the number of photos threshold has not been met yet
		// and while there is a nextPageToken to load more items.
		do {
			logger.debug(
				`Submitting search with parameters: ${JSON.stringify(parameters)}`);

			// Make a POST request to search the library or album

			let result = await postToGoogle(url, parameters);

			logger.debug(`Response: ${result}`);
			result = new MediaItemSearch(result);

			const items = !isEmpty(result) && !isEmpty(result.mediaItems)
				? result.mediaItems
					// The list of media items returned may be sparse and contain missing
					// elements. Remove all invalid elements.
					.filter(x => !x.isEmpty())
					// Media type filters can't be applied if an album is loaded, so an extra
					// filter step is required here to ensure that only images/videos are returned.
					// To only keep media items with an particualar (ex. images) filter by mime type.
					// .filter(x => x.isPicture())

					// filter videos that have failed to process or still processing
					.filter(x => !x.isVideo() || (x.isVideo() && !(x.hasFailedProcessing() || x.isProcessing())))
				: [];

			photos = photos.concat(items);

			// Set the pageToken for the next request.
			parameters.pageToken = result.nextPageToken;

			logger.verbose(
				`Found ${items.length} images in this request. Total images: ${photos.length}`);

			// Loop until the required number of photos has been loaded or until there
			// are no more photos, ie. there is no pageToken.
		} while ((photosToLoad < 0 || photos.length < photosToLoad) &&
			parameters.pageToken != null);

	} catch (err) {
		// Log the error and prepare to return it.
		error = err;
		logger.error(error);
	}

	logger.info('Search complete.');

	if(photosToLoadWasProvided) {
		// Since parameters was passed by reference, add 'photosToLoad' back in case caller still needs it
		parameters.photosToLoad = photosToLoad
	}

	photos = photos.map(x => x.toJson());

	return { photos, parameters, error };
}

/**
 * This function will respond with an error status code and the encapsulated data.error.
 * @param {Response} response Response object to check
 * @param {Object} data Data object to check
 */
export function returnError(response, data) {
	// Return the same status code that was returned in the error or use 500
	// otherwise.
	const statusCode = data.error.status || 500;
	// Return the error.
	response.status(statusCode).send(JSON.stringify(data.error));
}
/**
 * If the supplied result is successful, the parameters and media items are cached.
 * Helper method that returns and caches the result from a Library API search query returned by libraryApiSearch(...).
 * If the data.error field is set, the data is handled as an error and not cached. See returnError instead.
 * Otherwise, the media items are cached, the search parameters are stored and they are returned in the response.
 * @param {Response} response Response to use
 * @param {String} userId User ID to use with API
 * @param {Object} data
 * @param {Object} searchParameter
 */
export function returnPhotos(response, userId, data, searchParameter) {
	if (data.error) {
		returnError(response, data)
	} else {
		// Remove the pageToken and pageSize from the search parameters.
		// They will be set again when the request is submitted but don't need to be
		// stored.
		delete searchParameter.pageToken;
		delete searchParameter.pageSize;

		// Cache the media items that were loaded temporarily.
		MediaItemCache.setItem(userId, data.photos);
		// Store the parameters that were used to load these images. They are used
		// to resubmit the query after the cache expires.
		Storage.setItem(userId, { parameters: searchParameter });

		// Return the photos and parameters back int the response.
		response.status(200).send({ photos: data.photos, parameters: searchParameter });
	}
}

/**
 * This function will make a call to the URL and return the response
 * @param {String} url URL to call
 * @param {Object} options Options to use will call
 * @param {Boolean} retrying whether this call is a retry after a token refresh was performed
 * @returns {Promise<Object>} Response payload
 */
async function callGoogle(url, options, retrying = false){
	let optionsToUse = {};
	optionsToUse.headers = {
		...options.headers,
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + session.tokenInfo.token
	}

	Object.keys(options).forEach(key => {
		if(key !== 'headers'){
			optionsToUse[key] = options[key];
		}
	});

	const response = await fetch(url, optionsToUse);

	if(response.ok){
		// If the HTTP status is OK, return the body as JSON.
		let data = await response.json();
		return data;
	}
	else if(response.status === 401 && !retrying){
		// We got unauthorized, refresh token and try again
		await refreshToken(async () => await callGoogle(url, options, true));
	}
	else {
		await throwResponseError(response);
	}
}

/**
 * This function will make a GET call to the Google API
 * @param {String} url URL to use to make call
 * @returns {Promise<Object>} Response Payload
 */
async function getFromGoogle(url){
	return callGoogle(url, {method: 'GET'});
}

/**
 * This function will make a POST call to provided URL and return the provided response
 * @param {String} url URL to call
 * @param {Object} requestBody Request Body to send with post
 * @returns {Promise<Object>} Response payload
 */
async function postToGoogle(url, requestBody){
	const options = {
		method: 'post',
		body: (typeof requestBody === 'object') ? JSON.stringify(requestBody) : requestBody
	}

	return callGoogle(url, options);
}

/**
 * This function will refresh the Google Access Token
 */
function refreshToken(callbackOnRefresh){
	return new Promise((resolve, rejected) => {
		refresh.requestNewAccessToken(
			'google',
			session.tokenInfo.refreshToken,
			{},
			(err, token, refreshToken) => {
				if (!isEmpty(err) || isEmpty(token)) {
					logger.error('Error Refreshing token', err);
					rejected('Error refreshing Token' + err);
					return;
				}

				session.tokenInfo.token = token;
				if (!isEmpty(refreshToken) && session.tokenInfo.refreshToken !== refreshToken) {
					session.tokenInfo.refreshToken = refreshToken;
				}

				logger.debug('Token was refreshed');

				resolve(() => callbackOnRefresh());
			});

	});
}

/**
 * This function will process the response and attempt to extract any error message
 * @param {Response} response Re
 * @returns {Promise<void>}
 */
async function throwResponseError(response){
	// Throw a StatusError if a non-OK HTTP status was returned.
	let message = "";
	try {
		// Try to parse the response body as JSON, in case the server returned a useful response.
		message = await response.json();
	} catch (err) {
		// Ignore if no JSON payload was retrieved and use the status text instead.
	}
	throw new StatusError(response.status, response.statusText, message);
}

// Custom error that contains a status, title and a server message.
export class StatusError extends Error {
	constructor(status, title, serverMessage, ...params) {
		super(...params)
		this.status = status;
		this.statusTitle = title;
		this.serverMessage = serverMessage;
	}
}