const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

//utils
const { catchAsyng } = require ('../utils/catchAsync.util')
const { AppError } = require ('../utils/appError.util')

//models
const { User }= require('../models/user.model');


dotenv.config({ path: './config.env' });



const protectSession = catchAsyng (async (req ,res, next) =>{
  
    //get token
		let token
      
		console.log(token);

        if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
			) {
		//Extract token
        // req.headers.authoriation = 'Bearer token'
		token = req.headers.authorization.split(' ')[1] //-->[Bearer, token]
		}
       
		// check if the token was send or not
		if (!token) {
			return next(new AppError('Invalid Session',403))
			/* return res.status(403).json({ 
				status: 'error',
				message: 'invalid sesion',
			}) */
		}

		//verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
	 

        // verify the token's owner
	const user = await User.findOne({
		 where:{id: decoded.id, status:'active'},
		})

		  if (!user) {
			return next(new AppError('the owner of the session is no longer active',403))
			/* return res.status(403).json({
				status:'error',
				message:'the owner of the session is no longer active'
			}) */
			
		  }
		// grant access
		req.sessionUser = user
        next()
})

// create a middleware to protect the uses accounts
const protectUsersAccount = (req, res, next) => {
	const { sessionUser, user } = req;
	// const { id }= req.params
	// chech the sessionUser to compare to the one that wants to be update/deleted
	// if the users (ids)don't match,send an error,otherwise continue
	if (sessionUser.id !== user.id) {
		return next (new AppError('you are not the owner of this account',403))
		/* return res.status(403).json({
			status:'error',
			message:'you are not the owner of this account'
		}) */
		
	}
	// if the ids match, grant access
	next();

}

 //create middleware to protect post, only owners should be able to update/delate

  const protectPostsOwners = (req, res, next) => {
	const { sessionUser, post } = req;

	if ( sessionUser.id !== post.userId) {
		return next (new AppError('this post does not belong to you',403))
		/* return res.status(403).json({
			status:'error',
			message:'this post does not belong to you',
		}) */
		
	}
    next()
  }

 //create middleware to protect comment, only owners should be able to update/delate
 const protectCommentOwners = (req , res , next) =>{
	const{ sessionUser, comment} = req

	if (sessionUser.id !== comment.userId) {
		return next (new AppError('this comment does not belong to you',403))
		/* return res.status(403).json({
			status: 'error',
			message:'this comment does not belong to you'
		}) */
		
	}
	next()
 }


 // create middleware  that only grants access to admin users

 const protectAdmin = (req,res,next)=> {
	const {sessionUser} = req

	if (sessionUser.role !== 'admin') {
		return next (new AppError('you do not have the access level for this data',400))
		/* return res.status(400).json({
			status:'error',
			message:'you do not have the access level for this data'
		})
		 */
	}
	next()
 }


module.exports={
    protectSession,
	protectUsersAccount,
	protectPostsOwners,
	protectCommentOwners,
	protectAdmin,
}