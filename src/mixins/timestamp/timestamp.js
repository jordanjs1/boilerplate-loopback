/* eslint-disable no-param-reassign */
import dayjs from 'src/utils/moment';
import _debug from 'src/utils/debug';

const debug = _debug('timestamp');

const warn = (options, message) => {
	if (!options.silenceWarnings) {
		console.warn(message);
	}
};

export default (Model, bootOptions = {}) => {
	debug('TimeStamp mixin for Model %s', Model.modelName);

	const options = {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
		// required: true,
		validateUpsert: true, // default to turning validation off
		silenceWarnings: false,
		...bootOptions,
	};

	debug('options', options);

	if (!options.validateUpsert && Model.settings.validateUpsert) {
		Model.settings.validateUpsert = false;
		warn(options, `${Model.pluralModelName} settings.validateUpsert was overriden to false`);
	}

	if (Model.settings.validateUpsert && options.required) {
		warn(options, `Upserts for ${Model.pluralModelName} will fail when validation is turned on and time stamps are required`);
	}

	Model.defineProperty(options.createdAt, {
		type: 'number',
		required: options.required,
		index: options.index,
		default: dayjs().valueOf(),
	});

	Model.defineProperty(options.updatedAt, {
		type: 'number',
		required: options.required,
		index: options.index,
		default: dayjs().valueOf(),
	});

	Model.observe('before save', (ctx, next) => {
		debug('ctx.options', ctx.options);
		if (ctx.isNewInstance) {
			ctx.instance[options.createdAt] = dayjs().valueOf();
		}
		if (ctx.options && ctx.options.skipUpdatedAt) {
			return next();
		}
		if (ctx.instance) {
			debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt, ctx.instance.id);
			ctx.instance[options.updatedAt] = dayjs().valueOf();
		} else {
			debug('%s.%s before update matching %j', ctx.Model.pluralModelName, options.updatedAt, ctx.where);
			ctx.data[options.updatedAt] = dayjs().valueOf();
		}
		return next();
	});
};

module.exports = exports.default; // eslint-disable-line
