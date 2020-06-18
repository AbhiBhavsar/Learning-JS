const getDb = require("../util/database").getDb;

class Product {
	constructor(title, description, imageUrl, price) {
		(this.title = title),
			(this.description = description),
			(this.imageUrl = imageUrl),
			(this.price = price);
	}

	save() {
		const db = getDb();
		db.collections("products")
			.insertOne(this)
			.then((result = console.log(result)))
			.catch(err => console.log(err));
	}
}

module.exports = Product;
