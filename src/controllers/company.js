const db = require("../models");
const sequelize = require("sequelize");

const companyController = {
	getAll: async (req, res) => {
		try {
			const company = await db.Company.findAll();
			return res.send(company);
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				message: err.message,
			});
		}
	},
};

module.exports = companyController;
