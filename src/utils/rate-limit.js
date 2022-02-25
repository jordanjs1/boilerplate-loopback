import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';

const useRateLimit = (app) => {
	app.set('trust proxy', 1);

	const ignoreUrls = ['/api/v1/users/login'];

	const limiter = rateLimit({
		// store: new RedisStore({}),
		windowMs: 1 * 60 * 1000,
		// skipFailedRequests: true,
		max: 600,
		skip: (req) => {
			if (ignoreUrls.includes(req.originalUrl)) {
				return true;
			}
			return false;
		},
	});

	//  apply to all requests
	app.use('/api/', limiter);

	const anotherLimiter = rateLimit({
		// store: new RedisStore({}),
		windowMs: 56 * 1000,
		// skipFailedRequests: true,
		max: 5,
	});

	app.use('/api/v1/users/login', anotherLimiter);
};

export default useRateLimit;
