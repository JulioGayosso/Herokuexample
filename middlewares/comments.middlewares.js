// Models
const { Comment } = require('../models/comment.model');

//utils
const { catchAsyng } = require ('../utils/catchAsync.util')
const { AppError } = require ('../utils/appError.util')

const commentExists = catchAsyng( async (req, res, next) => {
	
		const { id } = req.params;

		const comment = await Comment.findOne({ where: { id } });

		if (!comment) {
			return  next (new AppError('Comment not found',404))
			/* return res.status(404).json({
				status: 'error',
				message: 'Comment not found',
			}); */
		}

		req.comment = comment;
		next();
});

module.exports = { commentExists };
