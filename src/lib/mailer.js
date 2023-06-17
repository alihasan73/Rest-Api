const nodemailer = require("nodemailer");

// transport menghubungkan email pengirim/sender ke nodemail
const transport = nodemailer.createTransport({
	auth: {
		user: process.env.NODEMAILER_EMAIL,
		pass: process.env.NODEMAILER_PASS,
	},
	host: "smtp.gmail.com",
});

const mailer = async ({ subject, html, to, text }) => {
	await transport.sendMail({
		subject: subject || "testing kirim email",
		html: html || "",
		to: to || "",
		text: text || "halo ini dari nodemailer",
	});
};

module.exports = mailer;
