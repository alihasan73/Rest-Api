const multer = require("multer");
const { nanoid } = require("nanoid");

const fileUploader = ({
	destinationFolder = "avatar",
	prefix = "POST",
	fileType = "image",
}) => {
	const storageConfig = multer.diskStorage({
		// configurasi tempat menyimpan file
		destination: (req, file, cb) => {
			cb(null, `${__dirname}/../public/${destinationFolder}`);
		},
		// rename nama file
		filename: (req, file, cb) => {
			const fileExtension = file.mimetype.split("/")[1];
			// image/png => [image, png]
			const filename = `${prefix}_${nanoid()}.${fileExtension}`;
			// POST_SDSAQWE.png
			cb(null, filename);
		},
	});
	const uploader = multer({
		storage: storageConfig,
		fileFilter: (req, file, cb) => {
			console.log(file);
			if (file.mimetype.split("/")[0] != fileType) {
				return cb(null, false);
			}
			cb(null, true);
		},
	});
	return uploader;
};

const upload = multer({
	limits: {
		fieldSize: 100000000000, //Byte
	},
	fileFilter: (req, file, cb) => {
		console.log(file);
		if (file.mimetype.split("/")[0] != "image") {
			return cb(null, false);
		}
		cb(null, true);
	},
});

module.exports = { fileUploader, upload };
