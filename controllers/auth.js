const bcrypt = require("bcryptjs");
// const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
	"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"
);
const User = require("../models/user");

// const transporter = nodemailer.createTransport(
// 	sendgridTransport({
// 		auth: {
// 			api_key:
// 				"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"
// 		}
// 	})
// );

const crypto = require("crypto");

exports.getLogin = (req, res, next) => {
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: req.flash("error")
	});
};

exports.getSignup = (req, res, next) => {
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup"
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email: email })
		.then(user => {
			if (!user) {
				req.flash("error", "Invalid email or password.");
				return res.redirect("/login");
			}
			bcrypt
				.compare(password, user.password)
				.then(doMatch => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(err => {
							console.log(err);
							res.redirect("/");
						});
					}
					res.redirect("/login");
				})
				.catch(err => {
					console.log(err);
					res.redirect("/login");
				});
		})
		.catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	User.findOne({ email: email })
		.then(userDoc => {
			if (userDoc) {
				return res.redirect("/signup");
			}
			return bcrypt
				.hash(password, 12)
				.then(hashedPassword => {
					const user = new User({
						email: email,
						password: hashedPassword,
						cart: { items: [] }
					});
					return user.save();
				})
				.then(result => {
					res.redirect("/login");
					console.log("sent");
					// return transporter
					// 	.sendMail({
					// 		to: email,
					// 		from: "ab@learingnode.com",
					// 		subject: "Signed successfully",
					// 		html: `<h1>User with ${email} has signed up successfully</h1>`,
					// 		replyTo: "abscrap20@gmail.com"
					// 	})
					// 	.catch(err => console.log(err));
					const msg = {
						to: email,
						from: "abscrap20@gmail.com",
						subject: "Sending with Twilio SendGrid is Fun",
						text: "and easy to do anywhere, even with Node.js",
						html: "<strong>and easy to do anywhere, even with Node.js</strong>"
					};
					sgMail.send(msg).catch(err => console.log(err));
				});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(err => {
		console.log(err);
		res.redirect("/");
	});
};

exports.getReset = (req, res, next) => {
	res.render("auth/reset", {
		path: "/reset",
		pageTitle: "Reset Password",
		errorMessage: req.flash("error")
	});
};

exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset");
		}
		const token = buffer.toString("hex");
		User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					req.flash("error", "User Noth Found");
					return res.redirect("/reset");
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 360000;
				return user.save();
			})
			.then(result => {
				res.redirect("/login");
				const msg = {
					to: req.body.email,
					from: "abscrap20@gmail.com",
					subject: "Password Reset Request",
					html: `<p>You requested the password request</p><p>click this <a href="http://localhost:3000/reset/${token}">link</a> to set the new password</p>`
				};
				sgMail.send(msg).catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() }
	})
		.then(user => {
			res.render("auth/new-password", {
				path: "/new-password",
				pageTitle: "Update Password",
				userId: user._id.toString(),
				errorMessage: "Error in new password page"
			});
		})
		.catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
	const { userId, passwordToken, newPassword } = req.body;
	let resetUser;
	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId
	})
		.then(user => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then(hashedPassword => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then(result => {
			res.redirect("/login");
		})
		.catch(err => console.log(err));
};
