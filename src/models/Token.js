module.exports = (sequelize, Sequelize) => {
	const Token = sequelize.define(
		"Tokens", // nama table
		{
			token: {
				type: Sequelize.STRING,
			},
			expired: {
				type: Sequelize.DATE,
			},
			payload: {
				type: Sequelize.STRING,
			}, // nama kolom
			valid: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			status: {
				type: Sequelize.ENUM("LOGIN", "FORGOT-PASSWORD"),
			},
		},
		{
			paranoid: true,
			// options
		}
	);
	return Token;
};
