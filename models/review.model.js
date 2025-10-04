const mongoose = require('mongoose');
const Tour = require('./tour.model');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'A review must have text'],
		},
		rating: {
			type: Number,
			required: [true, 'A review must have a rating'],
			min: 1,
			max: 5,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user'],
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour'],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo',
	});
	// this.populate({
	// 	path: 'tour',
	// 	select: 'name',
	// });

	next();
});

// Calculating Average rating and rating quantity
reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: `$tour`,
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);
	console.log(stats);

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
	// this points to current review
	this.constructor.calcAverageRatings(this.tour);
});

// These two functions update the ratings quantity
// and average after user updates it or deletes it
reviewSchema.pre(/^findOneAnd/, async function (next) {
	// `this` points to the current query
	this.r = await this.model.findOne(this.getQuery());
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	// `this.r` contains the document that was updated/deleted
	if (this.r) {
		await this.r.constructor.calcAverageRatings(this.r.tour);
	}
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
