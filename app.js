const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const rootDir = require("./utils/path");

app.set("view engine", "pug");
app.set("views", "./views");

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/admin", adminData.routes); //will route the requst starting with /admin as base route
app.use(shopRoutes);

app.use((req, res, next) => {
	//catch all routes for 404
	res.status(404).sendFile(path.join(rootDir, "views", "not-found.html"));
});

app.listen(3000);
