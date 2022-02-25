// import es from 'event-stream';

// export default function (app) {
// 	const Notification = app.models.Notification;

// 	Notification.createChangeStream((err, changes) => {
// 		if (err) {
// 			console.log('err', err);
// 		}

// 		changes.pipe(es.stringify()).pipe(process.stdout);
// 	});
// }
