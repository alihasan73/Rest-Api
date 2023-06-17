const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const private_key = process.env.PRIVATE_KEY;
const url = process.env.URL;
const url_image = process.env.IMAGE_URL;
const { Op } = require("sequelize");
// const moment = require("moment");
const sequelize = require("sequelize");
const { nanoid } = require("nanoid");
const moment = require("moment");
const mailer = require("../lib/mailer");

const userController = {
	getAll: async (req, res) => {
		try {
			const user = await db.User.findAll();

			return res.send(user);
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	},
	getLogin: async (req, res) => {
		try {
			const { email, password } = req.body;
			const user = await db.User.findOne({
				where: {
					email: email,
				},
			});
			if (user) {
				const match = await bcrypt.compare(password, user.dataValues.password);
				if (match) {
					const payload = {
						id: user.dataValues.id,
					};
					const token = jwt.sign(payload, private_key, {
						expiresIn: "1h",
					});
					console.log(token);
					return res.send({
						message: "login berhasil",
						value: user,
						token,
					});
				} else {
					throw new Error("login gagal");
				}
			} else {
				return res.send({
					message: "login gagal",
				});
			}
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	}, // JWT
	insertUserV1: async (req, res) => {
		try {
			const { fullname, address, email, password, company_id } = req.body;
			const halfPassword = await bcrypt.hash(password, 10);
			console.log(halfPassword);
			const newUser = await db.User.create({
				fullname,
				address,
				email,
				password: halfPassword,
				company_id,
			});
			res.send({
				message: "register berhasil",
				data: newUser,
			});
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	},
	getByToken: async (req, res) => {
		const { token } = req.query;
		let user = jwt.verify(token, private_key);

		user = await db.User.findOne({
			where: {
				id: user.id,
			},
		});
		delete user.dataValues.password;
		res.send(user);
	}, // JWT
	forgetPass: async (req, res) => {
		const { email } = req.query;
	},
	getLoginV2: async (req, res) => {
		try {
			const { emna, password } = req.query;
			const user = await db.User.findOne({
				where: {
					[Op.or]: [{ fullname: emna }, { email: emna }],
				},
			});
			if (user) {
				const match = await bcrypt.compare(password, user.dataValues.password);
				if (match) {
					const payload = {
						id: user.dataValues.id,
					};
					const generateToken = nanoid();
					const token = await db.Token.create({
						expired: moment().add(1, "days").format(),
						token: generateToken,
						payload: JSON.stringify(payload),
						valid: true,
						status: "LOGIN",
					});
					console.log(token);
					return res.send({
						message: "login berhasil",
						value: user,
						token: token.dataValues.token,
						// token,
					});
				} else {
					throw new Error("login gagal");
				}
			} else {
				return res.send({
					message: "login gagal",
				});
			}
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	}, // nanoId
	getByTokenV2: async (req, res, next) => {
		try {
			// const { token } = req.query;
			let token = req.headers.authorization;
			token = token.split(" ")[1];
			// console.log("asdsa");
			let p = await db.Token.findOne({
				where: {
					// token,
					// expired: {
					// 	[db.Sequelize.Op.gte]: moment().format(),
					// 	// [db.Sequelize.Op.lte]: moment().add(1, "days").format(),
					// },
					// valid: true,
					[Op.and]: [
						{
							token,
						},
						{
							expired: {
								[Op.gt]: moment("00:00:00", "hh:mm:ss").format(),
								[Op.lte]: moment().add(1, "d").format(),
							},
						},
						{
							valid: true,
						},
					],
				},
			});
			// console.log(token);
			if (!p) {
				throw new Error("Token has expired");
			}
			// console.log(p.dataValues);
			user = await db.User.findOne({
				where: {
					id: JSON.parse(p.dataValues.payload).id,
				},
			});
			delete user.dataValues.password;

			req.user = user;
			next();
		} catch (err) {
			return res.status(500).send({ message: err.message });
		}
	}, //  nanoId
	getUserByToken: async (req, res) => {
		res.send(req.user);
	},
	generateTokenByEmail: async (req, res) => {
		try {
			const { email } = req.query;
			// const { email } = req.params;
			console.log(email);
			const user = await db.User.findOne({
				where: {
					email,
				},
			});
			console.log(user.dataValues);
			if (user.dataValues) {
				await db.Token.update(
					{
						valid: false,
					},
					{
						where: {
							payload: JSON.stringify({ id: user.dataValues.id }),
							status: "FORGOT-PASSWORD",
						},
					}
				);
				const generateToken = nanoid();
				const token = await db.Token.create({
					expired: moment().add(5, "minutes").format(),
					token: generateToken,
					payload: JSON.stringify({ id: user.dataValues.id }),
					status: "FORGOT-PASSWORD",
				});

				// mailer({
				// 	subject: "hello",
				// 	to: "xypzquq@internetkeno.com",
				// 	text: url + token.dataValues.token,
				// });
				// tanpa email, langsung mengalihkan ke halaman
				return res.send({
					nav: "/rforgetpass/" + token.dataValues.token,
				});
				// return res.send({ message: "silahkan check email anda" });
			} else {
				throw new Error(`user not found`);
			}
		} catch (err) {
			res.status(500).send({ message: err.message });
		}
	},
	getTokenByEmail: async (req, res, next) => {
		try {
			const { token } = req.query;
			console.log(token);
			let p = await db.Token.findOne({
				where: {
					token,
					expired: {
						[db.Sequelize.Op.gte]: moment().format(),
					},
					valid: true,
				},
			});
			if (!p) {
				throw new Error("token has expired");
			}
			console.log(p.dataValues);
			user = await db.User.findOne({
				where: {
					id: JSON.parse(p.dataValues.payload).id,
				},
			});
			//id,email,nama,password,dll

			delete user.dataValues.password;
			next();
			req.user = user;
		} catch (err) {
			console.log(err);
			return res.status(500).send({ message: err.message });
		}
	},
	changePassword: async (req, res) => {
		try {
			const { token } = req.query;
			const { password } = req.body.user;
			const { id } = req.user;

			console.log(id);

			const hashPassword = await bcrypt.hash(password, 10);

			await db.User.update(
				{
					password: hashPassword,
				},
				{
					where: {
						id,
					},
				}
			);
			await db.Token.update(
				{
					valid: false,
				},
				{
					where: {
						token,
					},
				}
			);
			res.send({
				message: "password berhasil diupdate",
			});
		} catch (err) {
			res.status(500).send({ message: err.message });
		}
	},
	uploadAvatar: async (req, res) => {
		const { filename } = req.file;

		await db.User.update(
			{
				avatar_url: url_image + filename,
			},
			{
				where: {
					id: req.params.id,
				},
			}
		);

		await db.User.findOne({
			where: {
				id: req.params.id,
			},
		}).then((result) => res.send(result));
		// console.log("tes");
		// res.send(filename);
	},
};
module.exports = userController;
