// Alerts
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

// LOGIN
const loginForm = document.querySelector('.form--login');
if (loginForm) {
	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		try {
			const res = await axios.post('/api/v1/users/login', {
				email,
				password,
			});
			if (res.data.status === 'success') {
				showAlert('success', 'Logged in successfully');
				setTimeout(() => location.assign('/'), 1000);
			}
		} catch (err) {
			showAlert('error', err.response?.data?.message || 'Login failed');
		}
	});
}

// LOGOUT
const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
	logoutBtn.addEventListener('click', async (e) => {
		e.preventDefault();
		try {
			const res = await axios.get('/api/v1/users/logout');
			if (res.data.status === 'success') {
				window.location.assign('/'); // redirect home
			}
		} catch (err) {
			showAlert('error', 'Error logging out! Try again');
			console.error(err);
		}
	});
}
