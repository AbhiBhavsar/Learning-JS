const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const rootDir = require("./utils/path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/admin", adminRoutes); //will route the requst starting with /admin as base route
app.use(shopRoutes);

app.use((req, res, next) => {
	//catch all routes for 404
	res.status(404).sendFile(path.join(rootDir, "views", "not-found.html"));
});

app.listen(3000);
