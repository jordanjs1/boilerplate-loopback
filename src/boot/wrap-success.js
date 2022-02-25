export default function (app) {
	const remotes = app.remotes();

	remotes.after('**', (ctx, next) => {
		ctx.result = {
			statusCode: 200,
			// message: ctx.methodString + ' success',
			result: ctx.result || {},
		};

		next();
	});
}
