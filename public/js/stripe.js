export const hideAlert = () => {
	const el = document.querySelector('.alert');
	if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
	hideAlert();
	const markup = `<div class="alert alert--${type}">${msg}</div>`;
	document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
	window.setTimeout(hideAlert, 5000);
};
const stripe = Stripe(
	'pk_test_51SEXfhDCokLqv9LrWXHWVhn57PDg9QspUcxTFrM7LY6pg1GGg8hgPnJ5hVcYn6Tjf7VrAGVx6WAqLGh9xeQhQi4n00qgNCxBcR',
);

export const bookTour = async (tourId) => {
	try {
		// 1) Get checkout session from API
		const session = await axios(
			`http://localhost:5000/api/v1/bookings/checkout-session/${tourId}`,
		);
		console.log(session);
		// 2) Create checkout form and charge the credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		});
	} catch (err) {
		showAlert('error', err);
	}
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
	bookBtn.addEventListener('click', (e) => {
		e.target.textContent = 'Processing...';
		const { tourId } = e.target.dataset;
		bookTour(tourId);
	});
}
