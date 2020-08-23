const { validationResult } = require("express-validator");
exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: "1",
				title: "1st Post",
				content: "This is a very first dummy post",
				imageUrl: "images/dummy.png",
				creator: {
					name: "Abhi",
				},
				createdAt: new Date(),
			},
		],
	});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			messsage: "Validation failed!",
			errors: errors.array(),
		});
	}
	const title = req.body.title;
	const content = req.body.content;
	res.status(201).json({
		messsage: "Create operation successful",
		post: {
			id: new Date().toISOString(),
			title: title,
			content: content,
			creator: {
				name: "Abhi",
			},
			createdAt: new Date(),
		},
	});
};
