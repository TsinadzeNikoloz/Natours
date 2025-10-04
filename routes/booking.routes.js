const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authController.jwtProtect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('ADMIN', 'LEAD-GUIDE'));

router
	.route('/')
	.get(bookingController.getBookings)
	.post(bookingController.createBooking);

router
	.route('/:id')
	.get(bookingController.getBooking)
	.patch(bookingController.updateBooking)
	.delete(bookingController.deleteBooking);

module.exports = router;
