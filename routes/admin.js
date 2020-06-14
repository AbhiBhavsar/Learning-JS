const express = require("express");
const router = express.Router();
const path = require("path");
const rootDir = require("../utils/path");

const products = [];
//same rout names can be used with different methods
router.get("/add-product", (req, res, next) => {
	res.sendFile(path.join(rootDir, "views", "add-product.html"));
});
router.post("/add-product", (req, res, next) => {
	products.push({ title: req.body.title });
	res.redirect("/");
});

module.exports = {
	routes: router,
	products: products
};
