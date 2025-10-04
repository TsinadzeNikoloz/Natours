const express = require('express');
const viewsController = require('./../controllers/views.controller');
const authController = require('../controllers/auth.controller');
const bookingController = require('../controllers/booking.controller');

const router = express.Router();

router.get(
	'/',
	bookingController.createBookingCheckout,
	authController.isLoggedIn,
	viewsController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.jwtProtect, viewsController.getAccount);
router.get('/my-tours', authController.jwtProtect, viewsController.getMyTours);

router.post(
	'/submit-user-data',
	authController.jwtProtect,
	viewsController.updateUserData,
);

module.exports = router;
