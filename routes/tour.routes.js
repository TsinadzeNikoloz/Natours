const express = require('express');
const tourController = require('./../controllers/tour.controller');
const authController = require('./../controllers/auth.controller');
const reviewRouter = require('./../routes/review.routes');

const router = express.Router();

// router.param('id', tourController.checkID);
//Rerouting tour reviews to review router
router.use('/:tourId/reviews', reviewRouter);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(
		authController.jwtProtect,
		authController.restrictTo('ADMIN', 'LEAD-GUIDE', 'GUIDE'),
		tourController.getMonthlyPlan,
	);

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.jwtProtect,
		authController.restrictTo('ADMIN', 'LEAD-GUIDE'),
		tourController.createTour,
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.jwtProtect,
		authController.restrictTo('ADMIN', 'LEAD-GUIDE'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour,
	)
	.delete(
		authController.jwtProtect,
		authController.restrictTo('ADMIN', 'LEAD-GUIDE'),
		tourController.deleteTour,
	);

// router
// 	.route('/:tourId/reviews')
// 	.post(
// 		authController.jwtProtect,
// 		authController.restrictTo('USER', 'ADMIN'),
// 		reviewController.createReview,
// 	);

module.exports = router;
