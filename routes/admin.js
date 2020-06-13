const express = require("express");
const router = express.Router();
const rootDir = require("../utils/path");

//same rout names can be used with different methods
router.get("/add-product", (req, res, next) => {
	res.sendFile(path.join(rootDir, "views", "add-product.html"));
});
router.post("/add-product", (req, res, next) => {
	console.log(req.body);
	res.redirect("/");
});

module.exports = router;
