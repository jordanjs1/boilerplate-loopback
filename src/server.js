import loopback from 'loopback';
import boot from 'loopback-boot';
// import useragent from 'express-useragent';
import PrettyError from 'pretty-error';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import useLogger from 'src/utils/request-logger';
import useRateLimit from 'src/utils/rate-limit';

dotenv.config();

export const app = loopback();

const __DEV__ = process.env.NODE_ENV !== 'production';

if (__DEV__) {
	const prettyError = new PrettyError();

	prettyError.start();
}

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(bodyParser.json());

// app.use(useragent.express());

useRateLimit(app);

useLogger(app);

app.start = () => {
	// start the web server
	return app.listen(() => {
		app.emit('started');
		const baseUrl = app.get('url').replace(/\/$/, '');
		const brand = app.get('brand');

		console.log(brand + ' REST API server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			const explorerPath = app.get('loopback-component-explorer').mountPath;

			console.log(brand + ' Browse your REST API at %s%s', baseUrl, explorerPath);
		}
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
	if (err) {
		throw err;
	}

	// start the server if `$ node server.js`
	if (require.main === module) {
		app.start();
	}
});
