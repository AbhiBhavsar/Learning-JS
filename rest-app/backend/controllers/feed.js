const { validationResult } = require("express-validator/check");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	Post.find()
		.then((posts) => {
			if (!posts) {
				const error = new Error("Cannot find the posts");
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: "Posts fetched", posts: posts });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed, entered data is incorrect.");
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		imageUrl: "images/dummy.png",
		creator: { name: "Abhi" },
	});
	post
		.save()
		.then((result) => {
			res.status(201).json({
				message: "Post created successfully!",
				post: result,
			});
		})
		.catch((error) => {
			if (!error.statusCode) {
				error.statusCode = 500;
			}
			next(error);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Cannot find the post");
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: "Post fetched", post: post });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
