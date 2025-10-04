const dotenv = require('dotenv');
const chalk = require('chalk');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
	console.log(chalk.bold.redBright('Uncaught Exception! Shutting Down...'));
	console.log(chalk.bold.redBright(`${err.name}: ${err.message}`));
	process.exit(1);
});

dotenv.config({ path: './config.env', debug: false });
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
	console.log(chalk.bold.cyanBright('DATABASE connection successfull..'));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(
		chalk.bold.yellow(
			`Server running in ${process.env.NODE_ENV} mode on port: ${process.env.PORT}`,
		),
	);
});

process.on('unhandledRejection', (err) => {
	console.log('UNHADLED REJECTION! Shutting Down');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception! Shutting Down');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
