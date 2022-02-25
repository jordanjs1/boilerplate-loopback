/* --------------------------------------------------------
* Copyright ZelloSoft
* Website: https://www.zellosoft.com
*
* Author Phan Thanh Dat
* Email datpt@zellosoft.com
* Phone 0934036512
*
* Created: 2021-10-20 12:36:11
*------------------------------------------------------- */
import multiparty from 'multiparty';

const getData = (req) => {
	const p = new Promise((resolve, reject) => {
		const form = new multiparty.Form();

		form.parse(req, async (err, fields, files) => {
			if (err) {
				reject(err);
			}

			resolve({
				fields,
				files,
			});
		});
	});

	return p;
};

export default getData;
