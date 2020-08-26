const express = require("express");
const { body } = require("express-validator/check");
const user = require("../models/user");
const router = express.Router();

const authController = require("../controllers/auth");

router.put(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Enter a valid email")
			.custom((value, { req }) => {
				return user.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject("User Already Exsist");
					}
				});
			})
			.normalizeEmail(),
		body("password").trim().isLength({ min: 5 }),
		body("name").trim().not().isEmpty(),
	],
	authController.signup
);

module.exports = router;
