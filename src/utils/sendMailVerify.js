export default (Model, user, next) => {
	if (!user.email) {
		return next();
	}

	const webUrl = Model.app.get('webUrl');
	const apiUrl = Model.app.get('apiUrl');
	const brand = Model.app.get('brand');

	const [protocol, host] = apiUrl.split('://');

	const options = {
		type: 'email',
		host,
		protocol,
		port: protocol === 'https' ? 443 : 80,
		to: user.email,
		from: `"${process.env.EMAIL_NAME || (brand + ' Web Services')}" <${process.env.EMAIL}>`,
		subject: `[${brand}] Congratulations on successful account registration.`,
		template: 'src/email/verify.ejs',
		redirect: webUrl + '/email-verified',
		user,
		webUrl,
	};

	user.verify(options, (err, response) => {
		if (err) {
			console.log('verification email sent err ' + user.email, err);
			// User.deleteById(user.id);
			// return next(err);
		}

		console.log('> verification email sent:', response);

		if (typeof next === 'function') {
			next();
		}
	});
};
