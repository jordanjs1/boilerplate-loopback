/* eslint-disable no-param-reassign */
/* eslint-disable func-names */

import _debug from 'src/utils/debug';

const debug = _debug('readonly');

export default (Model, options = {}) => {
	debug('ReadOnly mixin for Model %s', Model.modelName);

	Model.stripReadOnlyProperties = function (ctx, modelInstance, next) {
		const { body } = ctx.req;

		if (!body) {
			return next();
		}
		const properties = (Object.keys(options).length > 0) ? options : null;

		if (properties) {
			debug('Creating %s : Read only properties are %j', Model.modelName, properties);
			Object.keys(properties).forEach((key) => {
				// debug('The \'%s\' property is read only, removing incoming data', key);
				// delete body[key];

				if (body[key]) {
					const err = new Error('Unable to update: ' + key + ' is read only.');

					err.statusCode = 403;
					return next(err);
				}
			});
			next();
		} else {
			const err = new Error('Unable to update: ' + Model.modelName + ' is read only.');

			err.statusCode = 403;
			next(err);
		}
	};

	Model.beforeRemote('create', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});
	Model.beforeRemote('upsert', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});
	Model.beforeRemote('prototype.updateAttributes', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});
	Model.beforeRemote('updateAll', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});

	// new remote methods from loopback 3
	Model.beforeRemote('prototype.patchAttributes', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});
	Model.beforeRemote('replaceById', (ctx, modelInstance, next) => {
		Model.stripReadOnlyProperties(ctx, modelInstance, next);
	});
};

module.exports = exports.default; // eslint-disable-line
