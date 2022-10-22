const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//utils 
const { catchAsyng } = require ('../utils/catchAsync.util')
const { AppError } = require('../utils/appError.util')

// Models
const { User } = require('../models/user.model');
const { Post } = require('../models/post.model');
const { Comment } = require('../models/comment.model');
//const { json } = require('sequelize/types');

dotenv.config({ path: './config.env' });


//gen random jwt signs
//require('crypto').randomBytes(64).toString('hex')

const getAllUsers = catchAsyng( async (req, res ,next) => {
	
     
		const usersnew = await User.findAll({
			attributes:{exclude:['password']},
			where: { status: 'active' },
			include: [
				{
					model: Post,
					include: {
						model: Comment,
						include: { model: User },
					},
				},
				{
					model: Comment,
				},
			],
		});

		res.status(200).json({
			status: 'success',
			data: {
				usersnew,
			},
		});
	
});

const createUser = catchAsyng( async (req, res ,next) => {
	
		const { name, email, password ,role} = req.body;

	  if (role !== 'admin' && role !== 'normal') {
		return next (new AppError('Invalid Role',400))
		/* return  res.status(400)-json({
			status:'error',
			message:'invalid role'
		})
		 */
	  }

		// Encrypt the password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
			role,
		});

		// Remove password from response
		newUser.password = undefined;

		// 201 -> Success and a resource has been created
		res.status(201).json({
			status: 'success',
			data: { newUser },
		});
	
});

const updateUser =catchAsyng( async (req, res ,next) => {
	
		const { name } = req.body;
		const { user } = req;

		// Method 1: Update by using the model
		// await User.update({ name }, { where: { id } });

		// Method 2: Update using a model's instance
		await user.update({ name });

		res.status(200).json({
			status: 'success',
			data: { user },
		});
	
});

const deleteUser = catchAsyng( async (req, res , next) => {
	
		const { user } = req;

		// Method 1: Delete by using the model
		// User.destroy({ where: { id } })

		// Method 2: Delete by using the model's instance
		// await user.destroy();

		// Method 3: Soft delete
		await user.update({ status: 'deleted' });

		res.status(204).json({ status: 'success' });
	
});

const login = catchAsyng( async (req,res ,next) => {
	
		//get email and password from req.body
		const {email ,password} = req.body

		//validate if the user exist with given email
		const user = await User.findOne({
			
			where: {email,status:'active'},
		})

		// if user doesnt exist,send error
		/* if (!user) {
			return res.status(404).json({
				status: 'error',
				message: 'user with given email doesnt exist',
			})
			
		} */

		//const isPasswordValid =	await bcrypt.compare(password, user.password)
		
		
		// if password doesn't match,send error
		
		//compare passwords (enter password vs db password)
		// if user doesn' exist or password doesn't match,send error

     if (!user || !(await bcrypt.compare(password, user.password)))
	  {
		return next(new AppError('Wrong Credentials',400))
		
	 }
     //remove password from response
	 user.password = undefined

	 //generate JSW (payload , secretorPrivatekey,options)
	 const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});


     res.status(200).json({
		status:'succes',
		data: {user , token}

	 })
		
})

module.exports = {
	getAllUsers,
	createUser,
	updateUser,
	deleteUser,
	login,
};
