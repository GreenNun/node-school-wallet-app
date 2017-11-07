'use strict';
const AutoPaymentModel = require('../../models/auto-payments');

module.exports = async (ctx) => {
	const cardId = ctx.params.id;
    const user = await ctx.usersModel.getBy({"login": ctx.request.body.login});
    const userId = user.id;
    const card = {
        userId: userId,
        cardNumber: ctx.request.body.cardNumber,
        balance: ctx.request.body.balance,
        parentId: Number(ctx.params.id)
    };
    const newCard = await ctx.cardsModel.create(card);

    /**
     * Тут ставится автоплатеж
     */
	await new AutoPaymentModel().create({
		cardId: cardId,
		sum: parseInt(card.balance, 10),
		date: new Date(Date.now()),
		receiverType: 'cardPayment',
		receiverNumber: card.cardNumber,
		isDone: false,
		dateRepeat: 'monthly'
	});

    ctx.status = 201;
    ctx.body = newCard;
};
