export const config = {};

// The callback to use for OAuth requests. This is the URL where the app is
// running. For testing and running it locally, use 127.0.0.1.
config.oAuthCallbackUrl = 'http://127.0.0.1:8080/auth/google/callback';

// The scopes to request. The app requires the 'photoslibrary.readonly' and
// plus.me scopes.
config.scopes = [
	'https://www.googleapis.com/auth/photoslibrary.readonly',
	'profile',
];

// The API endpoint to use. Do not change.
config.apiEndpoint = 'https://photoslibrary.googleapis.com';

// The API endpoint to use to refresh the access token
config.refreshTokenEndpoint = 'https://oauth2.googleapis.com/token'

// The number of photos to load for search requests.
config.photosToLoad = 150;

// The page size to use for search requests. 100 is recommended.
config.searchPageSize = 100;

// The page size to use for the listing albums request. 50 is recommended.
config.albumPageSize = 50;

export default config;