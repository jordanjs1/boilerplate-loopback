/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-prototype-builtins */

import slug from 'slugify';

let options = {
	separator: '-',
	slug: 'slug',
	fields: ['title'],
	lowercase: true,
};

export default (Model, ctx, opt, cb) => {
	let auxdata = ctx.instance || ctx.data;

	if (opt instanceof Object) {
		options = { ...options, ...opt };
	} else if (opt instanceof Function) {
		cb = opt; // eslint-disable-line
	}
	const make = (newdata) => {
		const slugify = (str) => {
			const from = 'ąàáäâãåæćęèéëêìíïîłńòóöôõøśùúüûñçżź';
			const to = 'aaaaaaaaceeeeeiiiilnoooooosuuuunczz';
			let regex = new RegExp('[' + from.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + ']', 'g'); // eslint-disable-line

			if (str == null) {
				return '';
			}

			str = String(str).toLowerCase().replace(regex, function (c) { // eslint-disable-line
				return to.charAt(from.indexOf(c)) || options.separator;
			});

			return str.replace(/[^\w\s-]/g, '').replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, options.separator).toLowerCase();
		};

		let strlug = '';

		options.fields.forEach((field) => {
			strlug += options.separator + newdata[field];
		});

		const startAt = options.separator.length;

		if (startAt === 0) {
			strlug = strlug.replace(' ', '');
		}
		strlug = slug(strlug.substr(startAt), options.separator);

		if (options.lowercase) {
			strlug = strlug.toLowerCase();
		}
		strlug = slugify(strlug);
		newdata[options.slug] = newdata[options.slug] || '';
		let iof = (newdata[options.slug].lastIndexOf(options.separator) === -1) ? (newdata[options.slug].length) : (newdata[options.slug].lastIndexOf(options.separator));

		// Para cadenas largas comprobacion
		const checkNumber = (n) => {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};

		const isNumber = checkNumber(parseInt(newdata[options.slug].substr(iof + 1, newdata[options.slug].length)));

		if (!isNumber) {
			iof = newdata[options.slug].length;
		}

		// Deficiencia si la cadena tiene un numero al final.
		if (newdata[options.slug].substr(0, iof) === strlug && newdata[options.slug].length) {
			newdata[options.slug] = newdata[options.slug];
			return cb(null);
		}
		newdata[options.slug] = strlug;

		const obj = {};

		obj[options.slug] = new RegExp('^' + strlug + '($|' + options.separator + ')');

		Model.find({
			where: obj,
		}, (err, docs) => {
			if (err) {
				cb(err);
			} else if (!docs.length) {
				cb(null);
			} else {
				const max = docs.reduce((mx, doc) => {
					const docSlug = doc[options.slug];
					let count = 1;

					if (docSlug !== strlug) {
						count = docSlug.match(new RegExp(strlug + options.separator + '([0-9]+)$'));
						count = (count instanceof Array ? parseInt(count[1]) : 0) + 1;
					}
					return count > mx ? count : mx;
				}, 0);

				if (max === 1) {
					newdata[options.slug] = strlug + options.separator + (max + 1);
				} else if (max > 0) {
					newdata[options.slug] = strlug + options.separator + max;
				} else {
					newdata[options.slug] = strlug;
				}
				ctx.currentInstance = newdata;
				cb(null);
			}
		});
	};

	let band = false;

	for (const field of options.fields) {
		if (!auxdata[field]) {
			return cb(null);
		}
	}

	if (ctx.currentInstance) {
		if (ctx.currentInstance.id) {
			band = true;
		} else {
			auxdata = ctx.currentInstance;
			return make(auxdata);
		}
	}
	if (band) {
		Model.findOne({
			where: {
				id: ctx.currentInstance.id,
			},
		}, (err, data) => {
			if (err) {
				return cb(err);
			}
			if (!data) {
				return cb(auxdata);
			}
			data = data.__data; // eslint-disable-line

			for (const i in data) {
				if (!auxdata[i]) {
					if (data.hasOwnProperty(i)) {
						auxdata[i] = data[i];
					}
				}
			}
			auxdata[options.slug] = data[options.slug];
			make(auxdata);
		});
	} else {
		if (auxdata.id) {
			Model.findOne({
				where: {
					id: auxdata.id,
				},
			}, (err, data) => {
				if (err) {
					return cb(err);
				}
				if (!data) {
					return cb(auxdata);
				}
				data = data.__data; // eslint-disable-line
				for (const i in data) {
					if (!auxdata[i]) {
						if (data.hasOwnProperty(i)) {
							auxdata[i] = data[i];
						}
					}
				}
				auxdata[options.slug] = data[options.slug];
				make(auxdata);
			});
		} else {
			make(auxdata);
		}
	}
};
