exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [{ title: "1st Post", content: "This is a very first dummy post" }],
	});
};

exports.createPost = (req, res, next) => {
	const title = req.body.title;
	const content = req.body.content;
	res.status(201).json({
		messsage: "Create operation successful",
		post: { id: new Date().toISOString(), title: title, content: content },
	});
};
