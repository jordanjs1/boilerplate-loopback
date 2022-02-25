// export default (app) => {
// 	const User = app.models.user;
// 	const Role = app.models.Role;
// 	const RoleMapping = app.models.RoleMapping;

// 	User.find({}, (errCheck, resultsCheck) => {
// 		if (resultsCheck.length === 0) {
// 			User.create([
// 				{ fullName: 'admin', email: 'admin@gmail.com', password: '123456', emailVerified: true, role: 'admin' }
// 			], (err, users) => {
// 				if (err) {
// 					throw err;
// 				}

// 				console.log('Created super admin:', users);

// 				// create the admin role
// 				Role.create({
// 					name: 'admin'
// 				}, (errRole, role) => {
// 					// if(err) throw err;

// 					console.log('Created role:', role);

// 					// make bob an admin
// 					users.forEach((el) => {
// 						role.principals.create({
// 							principalType: RoleMapping.USER,
// 							principalId: el.id
// 						}, (errMap, principal) => {
// 							// if(err) throw err;

// 							console.log('Created principal:', principal);
// 						});
// 					});
// 				});
// 			});
// 		}
// 	});
// };
