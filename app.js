const express = require('express');
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')


// Routers
const { usersRouter } = require('./routes/users.routes');
const { postsRouter } = require('./routes/posts.routes');
const { commentsRouter } = require('./routes/comments.routes');

//controllers
const {globalErrorHandler } = require ('./controllers/error.controller.js')

// Init our Express app
const app = express();

// Enable Express app to receive JSON data
app.use(express.json());

// add security headers
app.use(helmet())

// compress responses
app.use(compression())

if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))
else if (process.env.NODE_ENV === 'production') app.use(morgan('combined'))


// Define endpoints
app.use('/api/v1/usersnew', usersRouter);
app.use('/api/v1/postnew', postsRouter);
app.use('/api/v1/comments', commentsRouter);

// global error handler
app.use( globalErrorHandler)

// Catch non-existing endpoints
app.all('*', (req, res) => {
	res.status(404).json({
		status: 'error',
		message: `${req.method} ${req.url} does not exists in our server`,
	});
});

module.exports = { app };
