export default function (app) {
	const remotes = app.remotes();

	// Set X-Total-Count for all search requests
	remotes.before('*.deleteById', (ctx, next) => {
		this.findById(ctx.args.id, (err, instance) => {
			if (err) {
				return next(err);
			}
			ctx.args = { ...ctx.args, instance };
			next();
		});
	});

	remotes.after('*.deleteById', (ctx, next) => {
		ctx.result = {
			...ctx.result,
			id: ctx.args.id,
			instance: ctx.args.instance,
		};
		next();
	});
}
