'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import passport from 'passport';
import {fileURLToPath} from "url";
import routes from './routes.js';
import config from "./configs/config.js";
import {createLogger} from './libs/logging.js';
import {auth} from './libs/google.js';
import enableSessionHandling from './libs/sessions.js';


const app = express();
const logger = createLogger(app);
const server = http.Server(app);

// Use the EJS template engine
app.set('view engine', 'ejs');

// Disable browser-side caching to ensure any photos added to the selected
// album are available.
app.disable('etag');

// Parse application/json request data.
app.use(bodyParser.json());

// Parse application/xwww-form-urlencoded request data.
app.use(bodyParser.urlencoded({extended: true}));

enableSessionHandling(app);

// Set up OAuth 2.0 authentication through the passport.js library.
auth();

// Set up passport and session handling.
app.use(passport.initialize());
app.use(passport.session());

// Middleware that adds the user of this session as a local variable,
// so it can be displayed on all pages when logged in.
app.use((req, res, next) => {
    res.locals.name = '-';
    if (req.user && req.user.profile && req.user.profile.name) {
        res.locals.name =
            req.user.profile.name.givenName || req.user.profile.displayName;
    }

    res.locals.avatarUrl = '';
    if (req.user && req.user.profile && req.user.profile.photos) {
        res.locals.avatarUrl = req.user.profile.photos[0].value;
    }
    next();
});

// Set up static routes for hosted libraries.
app.use(express.static('static'));
app.use(
    '/mdlite',
    express.static(
        fileURLToPath(
            new URL('./node_modules/material-design-lite/dist/', import.meta.url)
        ),
    )
);
app.use(
    '/photoswipe',
    express.static(
        fileURLToPath(
            new URL('./node_modules/photoswipe/dist/', import.meta.url)
        ),
    )
);
app.use(
    '/js/libs',
    express.static(
        fileURLToPath(
            new URL('./libs/', import.meta.url)
        ),
    )
);
app.use(
    '/js/models',
    express.static(
        fileURLToPath(
            new URL('./models/', import.meta.url)
        ),
    )
);

routes(app, passport);

// Start the server
server.listen(config.port, () => {
  logger.info(`App listening on port ${config.port}`);
  logger.info('Press Ctrl+C to quit.');
});




