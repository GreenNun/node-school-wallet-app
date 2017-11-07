'use strict';

const ApplicationError = require('libs/application-error');

const DbModel = require('./common/dbModel');

class AutoPayments extends DbModel {
	constructor() {
		super('auto-payment');
	}

	/**
	 * Добавляет автоплатёж
	 *
	 * @param {Object} autoPayment описание автоплатежа
	 * @returns {Promise.<Object>}
	 */
	async create(autoPayment) {
		const isDataValid = autoPayment
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'cardId')
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'sum')
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'date')
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'receiverType')
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'receiverNumber')
			&& Object.prototype.hasOwnProperty.call(autoPayment, 'dateRepeat')
			&& (autoPayment.dateRepeat === 'none'
				|| autoPayment.dateRepeat === 'weekly'
				|| autoPayment.dateRepeat === 'monthly') ;

		if (isDataValid) {
			const newAutoPayment = Object.assign({}, autoPayment, {
				id: await this._generateId()
			});

			await this._insert(newAutoPayment);
			return newAutoPayment;
		}

		throw new ApplicationError('Auto-payment data is invalid', 400);
	}

	/**
	 * Отметить автоплатёж завершенным
	 *
	 * @param id
	 * @returns {Promise.<void>}
	 */
	async setDone(id) {
		await this._update({id}, {isDone:  true});
	}

	async extendForWeek(item) {
		const id = item.id;
		let newDate = new Date(item.date);
		// newDate = newDate.setMonth(newDate.getMonth(), newDate.getDay() + 7);

		await this._update({id}, {date:  newDate});
	}

	async extendForMonth(item) {
		const id = item.id;
		let newDate = new Date(item.date);
		// newDate = newDate.setMonth(newDate.getMonth() + 1);

		await this._update({id}, {date:  newDate});
	}
}

module.exports = AutoPayments;
