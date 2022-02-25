/* eslint-disable no-param-reassign */
import login from 'src/utils/login';
import sendMailVerify from 'src/utils/sendMailVerify';
import loopback from 'loopback';

import predefined from 'src/constant/predefined';

export default function (User) {
	User.validatesInclusionOf('loginType', { in: predefined.userLoginType });
	User.validatesInclusionOf('status', { in: predefined.userStatus });
	User.validatesUniquenessOf('phone');


	// User.disableRemoteMethod('create', true);
	User.disableRemoteMethod('deleteById', true);
	User.disableRemoteMethod('__delete__accessTokens', true);
	User.disableRemoteMethod('__create__accessTokens', true);
	User.disableRemoteMethod('__destroyById__accessTokens', true);

	User.beforeRemote('create', (ctx, u, next) => {
		const { data: user = {} } = ctx.args;

		if (!user.email && !user.phone) {
			return next({
				statusCode: 400,
				code: 'EMAIL_PHONE_REQUIRED',
				message: '{{email}} is required',
			});
		}
		next();
	});

	User.afterRemote('create', (ctx, user, next) => {
		sendMailVerify(User, user, next);
	});

	User.login = login;

	// send password reset link when requested
	User.on('resetPasswordRequest', (info) => {
		const webUrl = User.app.get('webUrl');
		const brand = User.app.get('brand');

		const params = { resetLink: webUrl + '/reset-password?access_token=' + info.accessToken.id };

		const renderer = loopback.template('src/email/reset-password.ejs');
		const html = renderer(params);

		User.app.models.Email.send({
			to: info.email,
			from: `"${process.env.EMAIL_NAME || (brand + ' Web Services')}" <${process.env.EMAIL}>`,
			subject: `[${brand}] Reset Password`,
			html,
		}, (err) => {
			if (err) {
				return console.log('> error sending password reset email ' + info.email, err);
			}
			console.log('> sending password reset email to:', info.email);
		});
	});

	User.beforeRemote('resetPassword', (ctx, opt, next) => {
		if (ctx.args.options.email) {
			User.findOne({ where: { email: ctx.args.options.email }, fields: { status: true, loginType: true } }, (err, user) => {
				if (err) {
					return next(err);
				}
				if (user && user.status === 'inactive') {
					return next({
						code: 'ACCOUNT_DISABLED',
						message: 'Account has been disabled',
						name: 'Error',
						status: 401,
						statusCode: 401,
					});
				}
				if (user && user.loginType !== 'email') {
					return next({
						code: 'ACCOUNT_INVALID',
						message: 'You have logged in this email via ' + user.loginType,
						name: 'Error',
						status: 401,
						statusCode: 401,
					});
				}
				return next();
			});
		} else {
			next();
		}
	});
}
