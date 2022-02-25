import { deprecate } from 'util';
import paginator from './paginator';

export default deprecate((app) => {
	app.loopback.modelBuilder.mixins.define('Paginator', paginator);
});

module.exports = exports.default; // eslint-disable-line
