const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/review.routes');
const viewRouter = require('./routes/view.routes');
const bookingRouter = require('./routes/booking.routes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares
// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
	'https://unpkg.com/',
	'https://tile.openstreetmap.org',
	'https://js.stripe.com',
	'https://checkout.stripe.com',
];

const styleSrcUrls = [
	'https://unpkg.com/',
	'https://tile.openstreetmap.org',
	'https://fonts.googleapis.com/',
	'https://js.stripe.com',
	'https://checkout.stripe.com',
];

const connectSrcUrls = [
	'https://unpkg.com/',
	'https://tile.openstreetmap.org',
	'https://js.stripe.com',
	'https://checkout.stripe.com',
];

const fontSrcUrls = [
	'https://fonts.googleapis.com',
	'https://fonts.gstatic.com',
];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			connectSrc: ["'self'", ...connectSrcUrls],
			imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
			fontSrc: ["'self'", ...fontSrcUrls],
			objectSrc: ["'none'"],
			workerSrc: ["'self'", 'blob:'],
			frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
		},
	}),
);
// Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limiting the amount of requests a user can make
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	}),
);

// Test Middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
	// const err = new Error(`Can't find ${req.originalUrl} on this Server`);
	// err.status = 'fail';
	// err.statusCode = 404;

	next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
