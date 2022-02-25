export default {
	...process.env,
	EMAIL_FROM: `"${process.env.EMAIL_NAME || (process.env.BRAND + ' Web Services')}" <${process.env.EMAIL}>`,
};
