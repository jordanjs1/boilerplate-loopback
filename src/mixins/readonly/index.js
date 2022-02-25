import { deprecate } from 'util';
import readonly from './readonly';

export default deprecate((app) => {
	app.loopback.modelBuilder.mixins.define('Readonly', readonly);
});

module.exports = exports.default; // eslint-disable-line
