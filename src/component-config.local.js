module.exports = { // eslint-disable-line
	'loopback-component-explorer': {
		'mountPath': '/explorer',
		'uiDirs': 'src/explorer',
		'apiInfo': {
			'title': process.env.BRAND + ' API',
			'description': `Copyright © ${process.env.BRAND} <br /> <a href="/explorer/docs.html">Document</a>`,
		},
	},
};
