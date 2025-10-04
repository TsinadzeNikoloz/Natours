const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please enter your name'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Please enter your email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please enter a valid email'],
		},
		photo: {
			type: String,
			default: 'default.jpg',
		},
		role: {
			type: String,
			enum: ['USER', 'GUIDE', 'LEAD-GUIDE', 'ADMIN'],
			default: 'USER',
		},
		password: {
			type: String,
			required: [true, 'Please enter a password'],
			minLength: 8,
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please enter password again'],
			minLength: 8,
			validate: {
				validator: function (el) {
					// This only works on CREATE and` SAVE!!!
					return el === this.password; // password is the same as passwordConfirm
				},
				message: 'Passwords must be the same',
			},
		},
		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
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

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 12);

	this.passwordConfirm = undefined;
	next();
});

userSchema.pre(/^find/, function (next) {
	// This points to the current query
	this.find({ active: { $ne: false } });
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10,
		);

		return JWTTimestamp < changedTimestamp;
	}

	// False means NOT changed
	return false;
};

userSchema.methods.createResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
