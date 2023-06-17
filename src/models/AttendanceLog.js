module.exports = (sequelize, Sequelize) => {
    const AttendanceLog = sequelize.define("AttendanceLogs", {
		clockIn: Sequelize.STRING,
		clockOut: Sequelize.STRING,
	});
	return AttendanceLog;
};
