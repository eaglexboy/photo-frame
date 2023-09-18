#Photo Frame

This is a simple application which uses the [Google Photos Library API](https://developers.google.com/photos) as a source for the Photo Frame.

This application is built using Express.js](https://expressjs.com/) and [Greensock Animation](https://greensock.com/)

## App Overview
This web application is an online photo frame that allows users to load photos from an album or the library and then show these images in a full screen Animated way.

## Set up
Before you can run this application, you must set up a Google Developers project and configure authentication credentials. Follow the
[get started guide](https://developers.google.com/photos/library/guides/get-started) to complete these steps:
1. Set up a Google Developers Project and enable the **Google Photos Library API**.
1. In your project, set up new OAuth credentials for a web server application. Set the authorized JavaScript origin to `http://127.0.0.1` and the authorized redirect URL to `http://127.0.0.1:8080/auth/google/callback` if you are running the app locally.
1. The console will display your authentication credentials. Add the `Client ID` and `Client secret` to the file `configs/credentials.js`, replacing the placeholder values:
```
// The OAuth client ID from the Google Developers console.
credentials.oAuthClientID = 'ADD YOUR CLIENT ID';

// The OAuth client secret from the Google Developers console.
credentials.oAuthclientSecret = 'ADD YOUR CLIENT SECRET';
```

You are now ready to run the sample:
1. Ensure [Node.JS](https://nodejs.org/) and [npm](https://www.npmjs.com/) are installed and available on your system. You need a recent Node.js version (v14 or later) to run this application.
1. Install dependencies: Run `npm install`,
1. Start the app: Run `node app.js`.

By default, the application will listen on port `8080`. Open a web browser and navigate to [http://127.0.0.1:8080](http://127.0.0.1:8080) to access the application.

# Troubleshooting
Make sure that you have configured the `Client ID` and the `Client secret` in the configuration file `configs/credentials.js`.
Also check that the URLs configured for these credentials match how you access the server. By default this is configured for 127.0.0.1 (localhost) on port 8080.

You can also start the application with additional debug logging by setting the `DEBUG` environment variable to `true`. For example:
```
DEBUG=TRUE node app.js
```

## Sources
This application was created using code from the following source

* [Google Photos Library API Samples](https://github.com/googlesamples/google-photos/tree/main)
* [Peter Barr's Deconstructed Advanced Staggers Grid](https://codepen.io/petebarr/pen/jONBMjd)
* [jQuery](https://github.com/jquery/jquery)
* [You might not need jQuery](https://youmightnotneedjquery.com)