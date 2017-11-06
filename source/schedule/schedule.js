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
	try {
		const cond = {
			// date: { '$gte': new Date() },
			date: {'$lt': new Date(Date.now())},
			isDone: false
		};
		const autoPaymentModel = new AutoPaymentModel();
		const cardModel = new CardsModel();
		const transactionModel = await new TransactionModel();
		const autoPayments = await autoPaymentModel.getMany(cond);
		for (const autoPayment of autoPayments){
			await cardModel.withdraw(autoPayment.cardId, autoPayment.sum);
			if (autoPayment.receiverType === 'cardPayment') {
				await transactionModel.create({
					cardId: autoPayment.cardId,
					userId: card.userId,
					type: 'withdrawCard',
					data: {
						cardNumber: autoPayment.receiverNumber
					},
					time: new Date().toISOString(),
					sum: autoPayment.sum
				});
			}
			if (autoPayment.receiverType === 'phonePayment') {
				await transactionModel.create({
					cardId: autoPayment.cardId,
					userId: card.userId,
					type: 'withdrawCard',
					data: {
						phoneNumber: autoPayment.receiverNumber
					},
					time: new Date().toISOString(),
					sum: autoPayment.sum
				});
			}
			await setAutoPaymentDoneOrExtend(autoPayment);
		}
		console.log('schedule!');
	} catch (e) {
		console.error('Autopayment error:', e.message)
	}
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
