/* eslint-disable no-unsafe-optional-chaining */

import morgan from 'morgan';
import path from 'path';

// eslint-disable-next-line import/no-commonjs
const rfs = require('rotating-file-stream');

const __DEV__ = process.env.NODE_ENV !== 'production';

morgan.token('user', (req, res) => {
	return (req.currentUser?.userId ? 'userId=' + req.currentUser?.userId : '') + (req?.remotingContext?.error && !__DEV__ ? (' - ' + JSON.stringify(req?.remotingContext?.error)) : '');
});

const useLogger = (app) => {
	if (__DEV__) {
		app.use(morgan(':method :url :status :response-time ms - :res[content-length] :user'));

		return;
	}

	const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user';

	app.use(morgan(
		format,
		{
			skip: (req, res) => {
				return res.statusCode === 401 || res.statusCode < 400;
			},
			stream: rfs.createStream('request-logs.log', {
				// size: '10M', // rotate every 10 MegaBytes written
				interval: '7d', // rotate daily
				maxFiles: 10,
				maxSize: '5M',
				// compress: 'gzip', // compress rotated files
				path: path.join(__dirname, '../../logs/error'),
			}),
		},
	));

	app.use(morgan(
		format,
		{
			skip: (req, res) => {
				return res.statusCode >= 400;
			},
			stream: rfs.createStream('access.log', {
				// size: '10M', // rotate every 10 MegaBytes written
				interval: '7d', // rotate daily
				maxFiles: 10,
				maxSize: '5M',
				// compress: 'gzip', // compress rotated files
				path: path.join(__dirname, '../../logs/info'),
			}),
		},
	));
};

export default useLogger;
