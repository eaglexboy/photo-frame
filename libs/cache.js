import persist from 'node-persist';
import {
	ALBUM_CACHE_TTL,
	MEDIA_ITEM_CACHE_TTL
} from '../configs/cache.js';

// Set up a cache for media items that expires after specified minutes.
// This caches the baseUrls for media items that have been selected
// by the user for the photo frame. They are used to display photos in
// the frame. The baseUrls are send to the frontend and displayed from there.
// The baseUrls are cached temporarily to ensure that the app is responsive and
// quick. Note that this data should only be stored for a short amount of time
// and that access to the URLs expires after 60 minutes.
// See the 'best practices' and 'acceptable use policy' in the developer
// documentation.
export const MediaItemCache = persist.create({
	dir: 'persist-mediaitemcache/',
	ttl: MEDIA_ITEM_CACHE_TTL
});
MediaItemCache.init();

// Temporarily cache a list of the albums owned by the user. This caches
// the name and base Url of the cover image. This ensures that the app
// is responsive when the user picks an album.
// Loading a full list of the albums owned by the user may take multiple
// requests. Caching this temporarily allows the user to go back to the
// album selection screen without having to wait for the requests to
// complete every time.
// Note that this data is only cached temporarily as per the 'best practices' in
// the developer documentation.
export const AlbumCache = persist.create({
	dir: 'persist-albumcache/',
	ttl: ALBUM_CACHE_TTL
});
AlbumCache.init();

// For each user, the app stores the last search parameters or album
// they loaded into the photo frame. The next time they log in
// (or when the cached data expires), this search is resubmitted.
// This keeps the data fresh. Instead of storing the search parameters,
// we could also store a list of the media item ids and refresh them,
// but resubmitting the search query ensures that the photo frame displays
// any new images that match the search criteria (or that have been added
// to an album).
export const Storage = persist.create({ dir: 'persist-storage/' });
Storage.init();