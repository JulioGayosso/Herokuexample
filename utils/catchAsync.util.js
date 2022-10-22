const catchAsyng = fn => {
	//try/catch benefits .... next(error)
	return(req, res, next) => {
		fn(req , res, next).catch(err => next(err))
	}
}

module.exports={catchAsyng}