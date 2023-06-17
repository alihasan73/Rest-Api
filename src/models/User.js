module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define("Users", {
		fullname: Sequelize.STRING,
		address: Sequelize.STRING,
		email: Sequelize.STRING,
		password: Sequelize.STRING,
		avatar_url: Sequelize.STRING,
	});
	return User;
};
