const mongodb = require("sequelize");
const getDb = require("../util/database").getDb;

class User {
	constructor(name, email, _id) {
		(this.name = name), (this.email = email);
		``;
		// (this._id = id ? new mongodb.ObjectId(id) : null);
	}

	save() {
		const db = getDb();
		return db.collection("users").insertOne(this);
	}
	static findById(userId) {
		const db = getDb();
		return db
			.collection("users")
			.findOne({ _id: new mongodb.ObjecId(userId) })
			.next();
	}
}

module.exports = User;
