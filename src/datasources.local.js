module.exports = { // eslint-disable-line
	'mongod': {
		'host': process.env.MONGO_HOST,
		'port': process.env.MONGO_PORT,
		'url': process.env.MONGO_URL,
		'database': process.env.MONGO_DATABASE,
		'user': process.env.MONGO_USER,
		'password': process.env.MONGO_PASSWORD,
		'name': 'mongod',
		'connector': 'mongodb',
		'allowExtendedOperators': true,
		'useNewUrlParser': true,
		'useFindAndModify': false,
		'useUnifiedTopology': true,
		'useCreateIndex': true,
		'writeConcern': {
			'j': true,
		},
	},
	'emailDs': {
		'name': 'emailDs',
		'connector': 'mail',
		'transports': [
			{
				'type': 'smtp',
				'host': process.env.EMAIL_HOST || 'smtp.gmail.com',
				'secure': true,
				'port': 465,
				'tls': {
					'rejectUnauthorized': false,
				},
				'auth': {
					'user': process.env.EMAIL,
					'pass': process.env.EMAIL_PASSWORD,
				},
			},
		],
	},
	'storage': {
		'name': 'storage',
		'connector': 'loopback-component-storage',
		'provider': 'amazon',
		'acl': 'public-read',
		'key': process.env.S3_KEY,
		'keyId': process.env.S3_KEY_ID,
		'maxFileSize': 20971520,
		'allowedContentTypes': [
			'image/jpg',
			'image/jpeg',
			'image/png',
			'image/tiff',
		],
	},
};
