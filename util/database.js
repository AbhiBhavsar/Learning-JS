const Sequelize = require("sequelize");

const sequelize = new Sequelize("nodeproject", "root", "", {
	host: "localhost",
	dialect: "mysql"
});

module.exports = sequelize;
