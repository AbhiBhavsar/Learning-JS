const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const { clearImage } = require("../utils/util");

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
		await user.save();
		return {
			...createdPost._doc,
			_id: createdPost._id.toString(),
			createdAt: createdPost.createdAt.toString(),
			updatedAt: createdPost.updatedAt.toString(),
		};
	},

	posts: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error("Unauthenticated");
			error.code = 401;
			throw error;
		}

		const totalPost = await Post.find().countDocuments();
		const posts = await Post.find().sort({ createdAt: -1 }).populate("creator");
		return {
			posts: posts.map((p) => {
				return {
					...p._doc,
					_id: p._id.toString(),
					createdAt: p.createdAt.toString(),
					updatedAt: p.updatedAt.toString(),
				};
			}),
			totalPosts: totalPost,
		};
	},

	post: async function ({ id }, req) {
		if (!req.isAuth) {
			const error = new Error("Unauthenticated");
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id).populate("creator");
		if (!post) {
			const error = new Error("post fetch failed");
			error.code = 404;
			throw error;
		}
		return {
			...post._doc,
			_id: post._id.toString(),
			createdAt: post.createdAt.toString(),
			updatedAt: post.updatedAt.toString(),
		};
	},
	updatePost: async function ({ id, postInput }, req) {
		if (!req.isAuth) {
			const error = new Error("Unauthenticated");
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id).populate("creator");
		if (!post) {
			const error = new Error("post fetch failed");
			error.code = 404;
			throw error;
		}
		if (post.creator._id.toString() !== req.userId.toString()) {
			const error = new Error("Un Authorized");
			error.code = 403;
			throw error;
		}
		post.title = postInput.title;
		post.content = postInput.content;
		if (postInput.imageUrl !== "undefined") {
			post.imageUrl = postInput.imageUrl;
		}
		const updatedPost = await post.save();
		return {
			...updatedPost._doc,
			_id: updatedPost._id.toString(),
			createdAt: updatedPost.createdAt.toString(),
			updatedAt: updatedPost.updatedAt.toString(),
		};
	},

	deletePost: async function ({ id }, req) {
		if (!req.isAuth) {
			const error = new Error("Unauthenticated");
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(id);
		if (!post) {
			const error = new Error("post fetch failed");
			error.code = 404;
			throw error;
		}
		if (post.creator.toString() !== req.userId.toString()) {
			const error = new Error("Un Authorized");
			error.code = 403;
			throw error;
		}
		clearImage(post.imageUrl);
		await post.findByIdAndRemove(id);
		const user = await User.findById(req.userId);
		user.posts.pull(id);
		await user.save();
		return true;
	},
};
