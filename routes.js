import {Authenticator} from 'passport';
import session from 'express-session';
import {getLogger} from './libs/logging.js';
import googleConfigs from './configs/google.js';
import {
	libraryApiGetAlbums,
	libraryApiSearch,
	returnError,
	returnPhotos,
} from './libs/google.js';
import {
	AlbumCache,
	MediaItemCache,
	Storage
} from './libs/cache.js';
import {isEmpty} from "./libs/core.js";

const logger = getLogger();

/**
 * This function will set all routes used by the application
 * @param {Object} app Express Application
 * @param {Authenticator} passport Passport to use for Authentication
 */
export function routes(app, passport) {
	// GET request to the root.
	// Display the login screen if the user is not logged in yet, otherwise the
	// photo frame.
	app.get(
		'/',
		(req, res) => {
			if(isNotAuthenticated(req)){
				// Not logged in yet.
				res.render('pages/login');
			} else {
				res.render('pages/frameSource');
			}
		}
	);

	// Loads the album page if the user is authenticated.
	// This page displays a list of albums owned by the user.
	app.get(
		'/album',
		(req, res) => {
			renderIfAuthenticated(req, res, 'pages/album');
		}
	);


	// Star the OAuth login process for Google.
	app.get(
		'/auth/google',
		passport.authenticate('google', {
			scope: googleConfigs.scopes,
			failureFlash: true,  // Display errors to the user.
			session: true,
			accessType: 'offline',
			prompt: 'consent'
		})
	);

	// Callback receiver for the OAuth process after log in.
	app.get(
		'/auth/google/callback',
		passport.authenticate(
			'google', { failureRedirect: '/', failureFlash: true, session: true }),
		(req, res) => {
			// User has logged in.
			logger.info('User has logged in.');
			req.session.save(() => {
				res.redirect('/');
			});
		}
	);

	// This will load the animated frame
	app.get(
		'/frame',
		(req, res) => {
			renderIfAuthenticated(req, res, 'pages/frame');
		}
	);

	// Returns all albums owned by the user.
	app.get(
		'/getAlbums',
		async (req, res) => {
			if(isNotAuthenticated(req)){
				res.render('pages/login');
				return;
			}

			logger.info('Loading albums');
			const userId = req.user.profile.id;

			// Attempt to load the albums from cache if available.
			// Temporarily caching the albums makes the app more responsive.
			const cachedAlbums = await AlbumCache.getItem(userId);
			if (cachedAlbums) {
				logger.verbose('Loaded albums from cache.');
				res.status(200).send(cachedAlbums);
			} else {
				logger.verbose('Loading albums from API.');
				// Albums not in cache, retrieve the albums from the Library API
				// and return them
				let data = await libraryApiGetAlbums(req.user);

				if (data.error) {
					// Error occured during the request. Albums could not be loaded.
					returnError(res, data);
					// Clear the cached albums.
					AlbumCache.removeItem(userId);
				} else {
					// Albums were successfully loaded from the API. Cache them
					// temporarily to speed up the next request and return them.
					// The cache implementation automatically clears the data when the TTL is
					// reached.
					AlbumCache.setItem(userId, data);
					res.status(200).send(data);
				}
			}
		});

	// Returns a list of the media items that the user has selected to
	// be shown on the photo frame.
	// If the media items are still in the temporary cache, they are directly
	// returned, otherwise the search parameters that were used to load the photos
	// are resubmitted to the API and the result returned.
	app.get(
		'/getQueue',
		async (req, res) => {
			if(isNotAuthenticated(req)){
				res.render('pages/login');
				return;
			}

			const userId = req.user.profile.id;

			logger.info('Loading queue.');

			// Attempt to load the queue from cache first. This contains full mediaItems
			// that include URLs. Note that these expire after 1 hour. The TTL on this
			// cache has been set to this limit and it is cleared automatically when this
			// time limit is reached. Caching this data makes the app more responsive,
			// as it can be returned directly from memory whenever the user navigates
			// back to the photo frame.
			const cachedPhotos = await MediaItemCache.getItem(userId);
			const stored = await Storage.getItem(userId);

			if (!isEmpty(cachedPhotos)) {
				// Items are still cached. Return them.
				logger.verbose('Returning cached photos.');
				res.status(200).send({ photos: cachedPhotos, parameters: stored.parameters });
			} else if (stored && stored.parameters) {
				// Items are no longer cached. Resubmit the stored search query and return
				// the result.
				logger.verbose(
					`Resubmitting filter search ${JSON.stringify(stored.parameters)}`);
				const data = await libraryApiSearch(req.user, stored.parameters);
				returnPhotos(res, userId, data, stored.parameters);
			} else {
				// No data is stored yet for the user. Return an empty response.
				// The user is likely new.
				logger.verbose('No cached data.')
				res.status(200).send({});
			}
		}
	);

	// Handles selections from the album page where an album ID is submitted.
	// The user has selected an album and wants to load photos from an album
	// into the photo frame.
	// Submits a search for all media items in the specified album to the Library API.
	// Returns a list of photos if this was successful, or an error otherwise.
	app.post(
		'/loadFromAlbum',
		async (req, res) => {
			if(isNotAuthenticated(req)){
				res.render('pages/login');
				return;
			}

			const albumId = req.body.albumId;
			const userId = req.user.profile.id;

			logger.info(`Importing album: ${albumId}`);

			// To list media in an album, construct a search request
			// where the parameter album ID is provided and the optional photosToLoad query parameter is also included.
			// Note that no other filters can be set, so this search will also return videos that are otherwise
			// filtered out in libraryApiSearch(..).
			const parameters = { albumId };
			if(req.body.photosToLoad){
				parameters.photosToLoad = req.body.photosToLoad;
			}

			// Submit the search request to the API and wait for the result.
			const data = await libraryApiSearch(req.user, parameters);

			returnPhotos(res, userId, data, parameters)
		}
	);

	// GET request to log out the user.
	// Destroy the current session and redirect back to the log in screen.
	app.get(
		'/logout',
		(req, res) => {
			req.logout((error) => {
				logger.error(error);
			});
			req.session.destroy();
			res.redirect('/');
		}
	);
}

// Renders the given page if the user is authenticated.
// Otherwise, redirects to "/".
function renderIfAuthenticated(req, res, page) {
  if (isNotAuthenticated(req)) {
    res.redirect('/');
  } else {
    res.render(page);
  }
}

function isNotAuthenticated(req){
	// Are we missing user data or not authenticated?
	if(isEmpty(req.user) || !req.isAuthenticated()){
		return true;
	}

	// Is session data missing?
	if(isEmpty(session.tokenInfo)){
		// Do we have the tokens in the user section?
		if(!isEmpty(req.user.token) && !isEmpty(req.user.refreshToken)){
			// Update session
			session.tokenInfo = {
				token: req.user.token,
				refreshToken: req.user.refreshToken
			}
			return false;
		}
		// Not Authenticated
		return true
	}

	// User is Authenticated
	return false;
}

export default routes;