import winston from 'winston';
import expressWinston from 'express-winston';

// Console transport for winston.
const consoleTransport = new winston.transports.Console();

// Set up winston logging.
const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple()
	),
	transports: [
		consoleTransport
	]
});


export function createLogger(app) {
	// Enable extensive logging if the DEBUG environment variable is set.
	if (process.env.DEBUG) {
		// Print all winston log levels.
		logger.level = 'silly';

		// Enable express.js debugging. This logs all received requests.
		app.use(expressWinston.logger({
			transports: [
				consoleTransport
			],
			winstonInstance: logger
		}));

	} else {
		// By default, only print all 'debug' log level messages or below.
		logger.level = 'debug';
	}

	return logger;
}

export function getLogger(){
	return logger;
}
