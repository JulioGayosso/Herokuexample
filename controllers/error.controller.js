 const dotenv = require('dotenv')

//utils
const { AppError } = require('../utils/appError.util')

 dotenv.config ({ path: './config.env'})

const sendErrorDev = (error, req, res) =>{

	res.status(error.statusCode).json({
		status:error.status,
		message:error.message,
		error,
		stack:error.stack,
		
	})
}

const sendErrorProd = ( error ,req ,res) => {
	res.status(error.statusCode).json({
		status:error.status,
		message:error.message || 'something error' ,  
		//error,
        
		//stack:error.stack,
	})
}

const tokenExpiredError = () =>{
 return new AppError('session expired',403)
}

const tokenInvalidSignatureError = ( )=> {
    return new AppError ('token invalid',403)
}

const  dbUniqueConstrainError = () => {
    return new AppError ('the email has already been entered',400)

}

const imgLimitError = () => {
 return new AppError ('you can only upload 3 images',400)
}


const globalErrorHandler = (error , req , res , next) => {
    //set default values for original error obj
    error.statusCode = error.statusCode || 500
	error.status = error.status || 'fail'
 
    if (process.env.NODE_ENV ==='development') {
        sendErrorDev(error,req,res)
         } else if (process.env.NODE_ENV === 'production') {
            let err = {...error}
            //when error is about expired token
           if (error.name === 'TokenExpiredError') err = tokenExpiredError()
           //when error is invalid signature
           else if(error.name ==='JsonWebTokenError') 
           err = tokenInvalidSignatureError()
           else if(error.name ==='SequelizeUniqueConstraintError')
           err = dbUniqueConstrainError()
          
          else if(error.code === 'LIMIT_UNEXPECTED_FILE') err = imgLimitError()

           
            sendErrorProd(err,req,res)
         }

   
}

 module.exports = {globalErrorHandler}