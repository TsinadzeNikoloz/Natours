import { showAlert } from './login.js';

// Type is either password or data
const updateSettings = async (data, type) => {
	try {
		const url =
			type === 'password'
				? 'http://localhost:5000/api/v1/users/updateMyPassword'
				: 'http://localhost:5000/api/v1/users/updateMe';

		const res = await axios({
			method: 'PATCH',
			url,
			data,
		});

		if (res.data.status === 'success')
			showAlert('success', `${type.toUpperCase()} updated successfully`);
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (userDataForm)
	userDataForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		form.append('photo', document.getElementById('photo').files[0]);

		updateSettings(form, 'data');
	});

if (userPasswordForm)
	userPasswordForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector('.btn--save-password').textContent =
			'Updating ...';
		const passwordCurrent =
			document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm =
			document.getElementById('password-confirm').value;

		await updateSettings(
			{ passwordCurrent, password, passwordConfirm },
			'password',
		);

		document.querySelector('.btn--save-password').textContent =
			'Save Passwords';
		document.getElementById('password-current').textContent = '';
		document.getElementById('password').textContent = '';
		document.getElementById('password-confirm').textContent = '';
	});
