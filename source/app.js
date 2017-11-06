'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const session = require('koa-session');
require('source/models/passport');
const passport = require('koa-passport');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser')();
const config = require('config');

const logger = require('libs/logger')('app');

const {renderToStaticMarkup} = require('react-dom/server');

const getCardsController = require('./controllers/cards/get-cards');
const getTransactionsController = require('./controllers/transactions/get-transactions');
const createCardController = require('./controllers/cards/create');
const deleteCardController = require('./controllers/cards/delete');
const getTransactionController = require('./controllers/transactions/get');
const getChildTransactionController = require('./controllers/transactions/get-child')
const createTransactionsController = require('./controllers/transactions/create');
const cardToCard = require('./controllers/cards/card-to-card');
const cardToMobile = require('./controllers/cards/card-to-mobile');
const mobileToCard = require('./controllers/cards/mobile-to-card');
const createUserController = require('./controllers/users/create');
const loginUserController = require('./controllers/users/login');

const errorController = require('./controllers/error');

const ApplicationError = require('libs/application-error');
const CardsModel = require('source/models/cards');
const TransactionsModel = require('source/models/transactions');

const mongoose = require('mongoose');

mongoose.connect(config.get('mongo.uri'), {useMongoClient: true});
mongoose.Promise = global.Promise;

const app = new Koa();

const getView = (viewId) => {
	const viewPath = path.resolve(__dirname, 'views', `${viewId}.server.js`);
	delete require.cache[require.resolve(viewPath)];
	return require(viewPath);
};

const getData = async (ctx) => {
	const {user} = ctx.state;
	delete user.password;
	const cards = await ctx.cardsModel.getAll(user.id);
	const transactions = await ctx.transactionsModel.getAll(user.id);

	return {
		user,
		cards,
		transactions
	};
};

// Сохраним параметр id в ctx.params.id
router.param('id', (id, ctx, next) => next());

router.get('/', async (ctx) => {
	if (ctx.isAuthenticated()) {
		const data = await getData(ctx);
		const indexView = getView('index');
		const indexViewHtml = renderToStaticMarkup(indexView(data));

		ctx.body = indexViewHtml;
	} else {
		ctx.redirect('sign-up.html');
	}
});

router.get('/cards/', getCardsController);
router.post('/cards/', createCardController);
router.delete('/cards/:id', deleteCardController);

router.get('/cards/:id/transactions/', getTransactionController);
router.get('/cards/:id/childTransactions/', getChildTransactionController);
router.post('/cards/:id/transactions/', createTransactionsController);

router.post('/cards/:id/transfer', cardToCard);
router.post('/cards/:id/pay', cardToMobile);
router.post('/cards/:id/fill', mobileToCard);

router.get('/transactions/', getTransactionsController);

router.post('/users/create', createUserController);
router.post('/users/login', loginUserController);

router.all('/error', errorController);

// logger
app.use(async (ctx, next) => {
	const start = new Date();
	await next();
	const ms = new Date() - start;
	logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error handler
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		logger.error('Error detected', err);
		ctx.status = err instanceof ApplicationError ? err.status : 500;
		ctx.body = `Error [${err.message}] :(`;
	}
});

// Создадим модель Cards и Transactions на уровне приложения и проинициализируем ее
app.use(async (ctx, next) => {
	ctx.cardsModel = new CardsModel();
	ctx.transactionsModel = new TransactionsModel();

	await next();
});

app.use(bodyParser);
app.keys = ['uu2tnEBvMHd65YdV5khdcTgafBDJDzEXSg25xdaaLdRsNUdu67hTQrEGCUf7jxUM'];
app.use(session({}, app));
app.use(passport.initialize());
app.use(passport.session());
app.use(router.routes());
app.use(serve('./public'));

const listenCallback = function () {
	const {
		port
	} = this.address();

	logger.info(`Application started on ${port}`);
};

const LISTEN_PORT = config.get('server.port') || 3000;

if (!module.parent && config.get('isHttps')) {
	const protocolSecrets = {
		key: fs.readFileSync(config.get('ssl.key')),
		cert: fs.readFileSync(config.get('ssl.cert'))
	};

	https
		.createServer(protocolSecrets, app.callback())
		.listen(LISTEN_PORT, listenCallback);
}

if (!module.parent && !config.get('isHttps')) {
	http
		.createServer(app.callback())
		.listen(LISTEN_PORT, listenCallback);
}

module.exports = app;
