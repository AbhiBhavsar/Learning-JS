const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class Product {
	constructor(title, description, imageUrl, price, id) {
		(this.title = title),
			(this.description = description),
			(this.imageUrl = imageUrl),
			(this.price = price),
			(this._id = id ? new mongodb.ObjectID(id) : null);
	}

	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			//update the product
			dbOp = db
				.collection("products")
				.updateOne({ _id: this._id }, { $set: this });
		} else {
			dbOp = db.collection("products").insertOne(this);
		}
		return dbOp
			.then(result => console.log(result))
			.catch(err => console.log(err));
	}

	static fetchAll() {
		const db = getDb();
		return db
			.collection("products")
			.find()
			.toArray()
			.then(products => products)
			.catch(err => console.log(err));
	}

	static findById(prodId) {
		const db = getDb();
		return db
			.collection("products")
			.find({ _id: new mongodb.ObjectID(prodId) })
			.next()
			.then(product => product)
			.catch(err => console.log(err));
	}

	static deleteById(prodId) {
		const db = getDb();
		return db
			.collection("products")
			.deleteOne({ _id: new mongodb.ObjectID(prodId) })
			.then(result => console.log(result))
			.catch(err => err);
	}
}

module.exports = Product;
