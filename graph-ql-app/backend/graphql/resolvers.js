const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");

module.exports = {
	createUser: async function ({ userInput }, req) {
		//   const email = args.userInput.email;
		const errors = [];
		if (!validator.isEmail(userInput.email)) {
			errors.push({ message: "invalid email" });
		}
		if (errors.length > 0) {
			const error = new Error("Invalid I/p");
			error.data = errors;
			error.code = 422;
			throw error;
		}
		const existingUser = await User.findOne({ email: userInput.email });
		if (existingUser) {
			const error = new Error("User exists already!");
			throw error;
		}
		const hashedPw = await bcrypt.hash(userInput.password, 12);
		const user = new User({
			email: userInput.email,
			name: userInput.name,
			password: hashedPw,
		});
		const createdUser = await user.save();
		return { ...createdUser._doc, _id: createdUser._id.toString() };
	},

	login: async function ({ email, password }) {
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error("No User Found");
			error.code = 401;
			throw error;
		}
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error("Incorrect Credentials");
			error.code = 401;
			throw error;
		}
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
			},
			"Th!sIs$ecretK3y",
			{ expiresIn: "1h" }
		);
		return { token: token, userId: user._id.toString() };
	},

	createPost: async function ({ postInput }, req) {
		if (!req.isAuth) {
			const error = new Error("Unauthenticated");
			error.code = 401;
			throw error;
		}
		const errors = [];
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({ message: "title is invalida" });
		}
		if (errors.length > 0) {
			const error = new Error("Invalid I/p");
			error.data = errors;
			error.code = 422;
			throw error;
		}

		const user = await User.findById(req.userId);
		if (!user) {
			const error = new Error("user fetch failed");

			error.code = 401;
			throw error;
		}
		const post = new Post({
			title: postInput.title,
			content: postInput.content,
			imageUrl: postInput.imageUrl,
			creator: user,
		});

		const createdPost = await post.save();
		user.posts.push(createdPost);
		return {
			...createdPost._doc,
			_id: createdPost._id.toString(),
			createdAt: createdPost.createdAt.toString(),
			updatedAt: createdPost.updatedAt.toString(),
		};
	},
};
