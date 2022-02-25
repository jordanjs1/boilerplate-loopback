import { deprecate } from 'util';
import timestamp from './timestamp';

export default deprecate((app) => {
	app.loopback.modelBuilder.mixins.define('Timestamp', timestamp);
});

module.exports = exports.default; // eslint-disable-line
