/* eslint-disable no-param-reassign */
/* eslint-disable import/no-commonjs */
import _debug from 'src/utils/debug';

const debug = _debug('paginator');

const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_NO_MAX_LIMIT = false;

export default (Model, options = {}) => {
	debug('Pagintor mixin for model %s', Model.modelName);

	const getLimit = (filter) => {
		if (filter && filter.limit) {
			let limit = parseInt(filter.limit, 10);

			if (options.maxLimit && !options.noMaxLimit) {
				limit = limit > options.maxLimit ? options.maxLimit : limit;
			}

			return limit;
		}

		return options.limit;
	};

	const modifyFilter = (filter) => {
		const skip = filter?.skip || 0;
		const exportData = filter?.exportData || false;
		const limit = getLimit(filter);

		if (!filter) {
			filter = {
				skip: exportData ? 0 : skip,
				limit: exportData ? undefined : limit,
			};
			return filter;
		}

		filter.skip = exportData ? 0 : skip;
		filter.limit = exportData ? undefined : limit;

		return filter;
	};

	Model.getApp((error, app) => {
		if (error) {
			debug(`Error getting app: ${error}`);
		}

		const globalOptions = app.get('paginator') || {};
		options.limit = options.limit || globalOptions.limit || DEFAULT_LIMIT;
		options.maxLimit = options.maxLimit || globalOptions.maxLimit || DEFAULT_MAX_LIMIT;
		options.noMaxLimit = options.noMaxLimit || globalOptions.noMaxLimit || DEFAULT_NO_MAX_LIMIT;
	});

	Model.beforeRemote('find', async (context) => {
		context.args.filter = modifyFilter(context.args.filter);
	});

	Model.afterRemote('find', async (context, next) => {
		const { limit, skip = 0, where } = context?.args?.filter || {};

		const total = await Model.count(where);

		context.result = {
			total,
			limit,
			skip,
			data: context.result,
		};
	});
};

module.exports = exports.default; // eslint-disable-line
