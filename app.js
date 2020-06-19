const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
	User.findById("5eec4314c70c7104a0ab647d")
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
	.connect(
		"mongodb+srv://node-user:node-user@node-testing-oefoa.mongodb.net/mongoose-db?retryWrites=true&w=majority"
	)
	.then(result => {
		User.findOne().then(user => {
			if (!user) {
				const user = new User({
					name: "Abhi",
					email: "abhi@mail.com",
					cart: {
						items: []
					}
				});
				user.save();
			}
		});

		app.listen(3000);
		console.log("[FROM APP JS]Connected...!");
	})
	.catch(err => console.log("[FROM APP JS]", err));
