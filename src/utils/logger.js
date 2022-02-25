/* eslint-disable no-unsafe-optional-chaining */
import 'winston-daily-rotate-file';

import winston from 'winston';
import path from 'path';

const __DEV__ = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
	level: 'error',
	// format của log được kết hợp thông qua format.combine
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.json(),
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		winston.format.prettyPrint(),
		winston.format.printf((log) => {
			// nếu log là error hiển thị stack trace còn không hiển thị message của log
			if (log.stack) return `[${log.timestamp}] [${log.level}] [${log.label}] ${log.stack}`;
			return `[${log.timestamp}] [${log.level}] [${log.label}] ${log.message}`;
		}),
	),
	// format: winston.format.json(),
	// defaultMeta: { service: 'user-service' },
	transports: [],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (__DEV__) {
	logger.add(new winston.transports.Console());
}

if (__DEV__) {
	logger.add(new winston.transports.DailyRotateFile({
		filename: path.join(__dirname, '../../logs/error/errors-%DATE%.log'),
		datePattern: 'YYYY-MM-DD-HH',
		zippedArchive: true,
		maxSize: '20m',
		maxFiles: '14d',
	}));
}

logger.writeLog = (error, label) => {
	logger.log({
		level: 'error',
		message: error,
		label: '32323',
	});
};

export default logger;
