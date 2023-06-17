const db = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const { Op } = require("sequelize");
const mainController = {
	getAll: async (req, res) => {
		try {
			const main = await db.AttendanceLogs.findAll();
			return res.send(main);
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	insertClockIn: async (req, res) => {
		try {
			const { user_id } = req.query;
			const attLog = await db.AttendanceLogs.findOne({
				where: {
					[Op.and]: [
						{
							user_id: user_id,
						},
						{
							[Op.and]: [
								{
									createdAt: {
										[Op.gt]: moment("00:00:00", "hh:mm:ss").format(),
									},
								},
								{
									createdAt: {
										[Op.lt]: moment("00:00:00", "hh:mm:ss")
											.add(1, "days")
											.format(),
									},
								},
							],
						},
					],
				},
			});
			if (!attLog) {
				await db.AttendanceLogs.create({
					clockIn: moment().format(),
					user_id: user_id,
				}).then((result) =>
					res.send({
						message: "Berhasil ClockIn",
						data: result,
					})
				);
			} else {
				res.send({
					message: "Kamu sudah clockIn",
				});
			}
		} catch (err) {
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	getOne: async (req, res) => {
		try {
			const { user_id } = req.query;
			const today = await db.AttendanceLogs.findOne({
				where: {
					[Op.and]: [
						{
							user_id: user_id,
						},
						{
							[Op.and]: [
								{
									createdAt: {
										[Op.gt]: moment("00:00:00", "hh:mm:ss").format(),
									},
								},
								{
									createdAt: {
										[Op.lt]: moment("00:00:00", "hh:mm:ss")
											.add(1, "days")
											.format(),
									},
								},
							],
						},
					],
				},
			});
			console.log(today);
			res.send(today);
		} catch (err) {
			console.log(err);
			res.status(500).send({
				message: err.message,
			});
		}
	},
	editLog: async (req, res) => {
		try {
			const { user_id } = req.query;
			const attLog = await db.AttendanceLogs.findOne({
				where: {
					[Op.and]: [
						{
							user_id: user_id,
						},
						{
							[Op.and]: [
								{
									createdAt: {
										[Op.gt]: moment("00:00:00", "hh:mm:ss").format(),
									},
								},
								{
									createdAt: {
										[Op.lt]: moment("00:00:00", "hh:mm:ss")
											.add(1, "days")
											.format(),
									},
								},
							],
						},
					],
				},
			});
			if (attLog) {
				if (!attLog.dataValues.clockOut) {
					await db.AttendanceLogs.update(
						{
							clockOut: moment().format(),
						},
						{
							where: {
								id: attLog.id,
							},
						}
					);
					await db.AttendanceLogs.findOne({
						where: {
							id: attLog.id,
						},
					}).then((result) =>
						res.send({
							message: "Berhasil ClockOut",
							data: result,
						})
					);
				} else {
					res.send({
						message: "Kamu sudah ClockOut",
					});
				}
			} else {
				res.send("Belum clock in");
			}
		} catch (error) {
			return res.status(500).send({
				message: error.message,
			});
		}
	},
	getSemua: async (req, res) => {
		try {
			const one = await db.AttendanceLogs.findOne({
				attributes: ["clockIn", "clockOut", "createdAt"],
				where: {
					createdAt: moment().format(),
				},
			});
			return res.json(one);
		} catch (err) {
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	getHistori: async (req, res) => {
		try {
			const { user_id, awal, akhir } = req.query;
			const val = await db.AttendanceLogs.findAll({
				where: {
					[Op.and]: [
						{
							user_id: user_id,
						},
						{
							[Op.and]: [
								{
									createdAt: {
										[Op.gte]: awal,
									},
								},
								{
									createdAt: {
										[Op.lte]: akhir,
									},
								},
							],
						},
					],
				},
			});
			res.send(val);
		} catch (error) {
			return res.status(500).send({
				message: error.message,
			});
		}
	},
};

module.exports = mainController;
