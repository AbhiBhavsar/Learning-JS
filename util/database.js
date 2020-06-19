const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = callback => {
	MongoClient.connect(
		"mongodb+srv://node-user:node-user@node-testing-oefoa.mongodb.net/shop?retryWrites=true&w=majority"
	)
		.then(client => {
			console.log(`Connected...!`);
			_db = client.db(); //we can pass a database name to connect to as db's parameter
			callback();
		})
		.catch(err => {
			console.log(err);
			throw err;
		});
};

const getDb = () => {
	if (_db) {
		return _db;
	}
	throw "No Database Found";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
