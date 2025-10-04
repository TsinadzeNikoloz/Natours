const express = require('express');
const reviewController = require('./../controllers/review.controller');
const authController = require('./../controllers/auth.controller');

const router = express.Router({ mergeParams: true });

router.use(authController.jwtProtect);

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictTo('USER'),
		reviewController.setTourUserIds,
		reviewController.createReview,
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo('ADMIN', 'USER'),
		reviewController.updateReview,
	)
	.delete(
		authController.restrictTo('ADMIN', 'USER'),
		reviewController.deleteReview,
	);

module.exports = router;
