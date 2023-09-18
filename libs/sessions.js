import session from 'express-session';
import sessionFileStore from 'session-file-store';
import authenticationCredentials from '../configs/credentials.js';


const fileStore = sessionFileStore(session);

// Set up a session middleware to handle user sessions.
const sessionMiddleware = session({
	resave: true,
	saveUninitialized: true,
	store: new fileStore({}),
	secret: authenticationCredentials.cookieSessionKey,
});

function initSession(app) {
	// Enable user session handling.
	app.use(sessionMiddleware);
}

export default initSession;