// Models
const { User } = require('../models/user.model');

//utils
const { catchAsyng } = require('../utils/catchAsync.util')
const { AppError } = require('../utils/appError.util')

const userExists = catchAsyng( async (req, res, next) => {
	
		const { id } = req.params;

		const user = await User.findOne({ 
		attributes:{ exclude: ['password'] },
		where: { id } ,
		});

		// If user doesn't exist, send error message
		if (!user) {
			return next (new AppError('user no found',404))
			
		}

		// req.anyPropName = 'anyValue'
		req.user = user;
		next();
	
});

module.exports = {
	userExists,
};
