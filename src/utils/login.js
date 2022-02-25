import utils from 'loopback/lib/utils';
import g from 'loopback/lib/globalize';

/* eslint no-param-reassign: 0 */

const splitPrincipal = (name, realmDelimiter) => {
	const parts = [null, name];

	if (!realmDelimiter) {
		return parts;
	}
	const index = name.indexOf(realmDelimiter);

	if (index !== -1) {
		parts[0] = name.substring(0, index);
		parts[1] = name.substring(index + realmDelimiter.length);
	}
	return parts;
};

const normalizeCredentials = (credentials, realmRequired, realmDelimiter) => {
	const query = {};

	credentials = credentials || {};

	if (!realmRequired) {
		if (credentials.email) {
			query.email = credentials.email;
		} else if (credentials.username) {
			query.username = credentials.username;
		} else if (credentials.phone) {
			query.phone = credentials.phone;
		}
	} else {
		if (credentials.realm) {
			query.realm = credentials.realm;
		}
		let parts;

		if (credentials.email) {
			parts = splitPrincipal(credentials.email, realmDelimiter);
			query.email = parts[1];
			if (parts[0]) {
				query.realm = parts[0];
			}
		} else if (credentials.username) {
			parts = splitPrincipal(credentials.username, realmDelimiter);
			query.username = parts[1];
			if (parts[0]) {
				query.realm = parts[0];
			}
		} else if (credentials.phone) {
			parts = splitPrincipal(credentials.phone, realmDelimiter);
			query.phone = parts[1];
			if (parts[0]) {
				query.realm = parts[0];
			}
		}
	}
	return query;
};

export default function (credentials, include = '{}', fn) {
	const self = this;

	if (typeof include === 'function') {
		fn = include;
		include = '{}';
	}

	fn = fn || utils.createPromiseCallback();

	// include = (include || '');
	// if (Array.isArray(include)) {
	// 	include = include.map(function (val) {
	// 		return val.toLowerCase();
	// 	});
	// } else {
	// 	include = include.toLowerCase();
	// }

	let realmDelimiter;
	// Check if realm is required
	const realmRequired = !!(self.settings.realmRequired || self.settings.realmDelimiter);

	if (realmRequired) {
		realmDelimiter = self.settings.realmDelimiter;
	}

	const query = normalizeCredentials(credentials, realmRequired, realmDelimiter);

	if (realmRequired && !query.realm) {
		const err1 = new Error(g.f('{{realm}} is required'));

		err1.statusCode = 400;
		err1.code = 'REALM_REQUIRED';
		fn(err1);
		return fn.promise;
	}

	if (!query.email && !query.username && !query.phone) {
		const err2 = new Error(g.f('{{username}} or {{email}} or {{phone}} is required'));

		err2.statusCode = 400;
		err2.code = 'USERNAME_EMAIL_PHONE_REQUIRED';
		fn(err2);
		return fn.promise;
	}

	self.findOne({
		...JSON.parse(include),
		where: query,
	}, (err, user) => {
		const defaultError = new Error(g.f('login failed'));

		defaultError.statusCode = 401;
		defaultError.code = 'LOGIN_FAILED';

		const tokenHandler = (errr, token) => {
			if (errr) {
				return fn(errr);
			}
			// if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
			// NOTE(bajtos) We can't set token.user here:
			//  1. token.user already exists, it's a function injected by
			//     "AccessToken belongsTo User" relation
			//  2. ModelBaseClass.toJSON() ignores own properties, thus
			//     the value won't be included in the HTTP response
			// See also loopback#161 and loopback#162
			// token.__data.user = user;
			// }
			token.__data.user = user;
			fn(errr, token);
		};

		if (err) {
			defaultError.message = 'An error is reported from User.findOne: ' + err;
			fn(defaultError);
		} else if (user) {
			if (user && user.loginType !== 'email') {
				defaultError.message = 'You have logged in this email via ' + user.loginType;
				return fn(defaultError);
			}
			user.hasPassword(credentials.password, (er, isMatch) => {
				if (er) {
					defaultError.message = 'An error is reported from User.hasPassword: ' + err;
					fn(defaultError);
				} else if (isMatch) {
					if (user.status === 'inactive') {
						defaultError.message = 'Account was blocked';
						return fn(defaultError);
					}

					if (self.settings.emailVerificationRequired && !user.emailVerified && user.loginType === 'email') {
						// Fail to log in if email verification is not done yet
						// debug('User email has not been verified');
						er = new Error(g.f('login failed as the email has not been verified'));
						er.statusCode = 401;
						er.code = 'LOGIN_FAILED_EMAIL_NOT_VERIFIED';
						er.details = {
							userId: user.id,
						};
						fn(er);
					} else {
						if (user.createAccessToken.length === 2) {
							user.createAccessToken(credentials.ttl, tokenHandler);
						} else {
							user.createAccessToken(credentials.ttl, credentials, tokenHandler);
						}
					}
				} else {
					defaultError.message = 'The password is invalid for user ' + (query.email || query.username || query.phone);
					fn(defaultError);
				}
			});
		} else {
			defaultError.message = 'No matching record is found for user ' + (query.email || query.username || query.phone);
			fn(defaultError);
		}
	});
	return fn.promise;
}
