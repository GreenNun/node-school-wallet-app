const schedule = require('node-schedule');

const AutoPaymentModel = require('../models/auto-payments');
const CardsModel = require('../models/cards');
const TransactionModel = require('../models/transactions');

schedule.scheduleJob('0 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

schedule.scheduleJob('10 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

schedule.scheduleJob('20 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

schedule.scheduleJob('30 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

schedule.scheduleJob('40 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

schedule.scheduleJob('50 * * * * *', async () => {
	await scheduleAutoPaymentJob();
});

async function scheduleAutoPaymentJob() {
	const cond = {
		// date: { '$gte': new Date() },
		date: {'$lt': new Date()},
		isDone: false
	};

	await new AutoPaymentModel().getMany(cond)
		.then(async (result) => {
			console.log('search result: ' + result);
			result.forEach(async (autoPayment) => {
				const card = await new CardsModel().get(autoPayment.cardId);
				await new CardsModel().withdraw(autoPayment.cardId, autoPayment.sum)
					.then(async () => {
						if (autoPayment.receiverType === 'cardPayment') {
							return await new TransactionModel()
								.create({
									cardId: autoPayment.cardId,
									userId: card.userId,
									type: 'withdrawCard',
									data: {
										cardNumber: autoPayment.receiverNumber
									},
									time: new Date().toISOString(),
									sum: autoPayment.sum
								})
								.then(async () => {
									return await setAutoPaymentDone(autoPayment);
								})
								.catch((err) => {
									console.error('AutoPayment transaction Error')
								});
						} else if (autoPayment.receiverType === 'phonePayment') {
							return await new TransactionModel()
								.create({
									cardId: autoPayment.cardId,
									userId: card.userId,
									type: 'withdrawCard',
									data: {
										phoneNumber: autoPayment.receiverNumber
									},
									time: new Date().toISOString(),
									sum: autoPayment.sum
								})
								.then(async (result) => {
									return await setAutoPaymentDone(autoPayment);
								}).catch((err) => {
									console.error('AutoPayment transaction Error')
								});
						}
						// else {
						// 	new AutoPaymentModel()._remove(autoPayment.id);
						// }
					}).catch((err) => {
						console.error('AutoPayment Error');
					})
			})
		});
	console.log('schedule!');
}

async function setAutoPaymentDoneOrExtend(autoPayment) {
	if (autoPayment.dateRepeat === 'none') {
		await new AutoPaymentModel().setDone(autoPayment.id);
	} else if (autoPayment.dateRepeat === 'weekly') {
		await new AutoPaymentModel().extendForWeek(autoPayment);
	} else if (autoPayment.dateRepeat === 'monthly') {
		await new AutoPaymentModel().extendForMonth(autoPayment);
	} else {
		console.error('AutoPayment DoneOrExtend Error');
	}
}
