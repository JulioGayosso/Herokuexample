class AppError extends Error{
    constructor(message, statusCode){
        super(message)

        //status = error 4xx ->cliente // fail 5xx -> server
        
        this.message = message
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'error':'fail';

        //capture the error stack and add it to the AppError instance
        Error.captureStackTrace(this)
    }
}

module.exports={AppError}