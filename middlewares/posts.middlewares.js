// Models
const { Post } = require('../models/post.model');
//utils
const { catchAsyng } = require ('../utils/catchAsync.util')
const {AppError } = require ('../utils/appError.util')

const postExists = catchAsyng( async (req, res, next) => {
	try {
		const { id } = req.params;

		const post = await Post.findOne({ where: { id } });

		if (!post) {
			return next (new AppError('Post not found',404))
			/* return res.status(404).json({
				status: 'error',
				message: 'Post not found',
			}); */
		}

		req.post = post;
		
		next();
	} catch (error) {
		console.log(error);
	}
});

module.exports = { postExists };
