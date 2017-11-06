import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'emotion/react';
import axios from 'axios';
import {Switch, DatePicker, Select} from 'antd';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

import {Island, Title, Button, Input} from './';

const MobilePaymentLayout = styled(Island)`
	width: 440px;
	background: #108051;
`;

const MobilePaymentTitle = styled(Title)`
	color: #fff;
`;

const InputField = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 26px;
	position: relative;
	padding-left: 150px;
`;

const Label = styled.div`
	font-size: 15px;
	color: #fff;
	position: absolute;
	left: 0;
`;

const Currency = styled.span`
	font-size: 13px;
	color: #fff;
	margin-left: 12px;
`;

const Commission = styled.div`
	color: rgba(255, 255, 255, 0.6);
	font-size: 13px;
	text-align: right;
	margin: 35px 0 20px;
`;

const Underline = styled.div`
	height: 1px;
	margin-bottom: 20px;
	background-color: rgba(0, 0, 0, 0.16);
`;

const PaymentButton = styled(Button)`
	float: right;
`;

const InputPhoneNumber = styled(Input)`
	width: 225px;
`;

const InputSum = styled(Input)`
	width: 160px;
`;

const InputCommision = styled(Input)`
	cursor: no-drop;
	width: 160px;
	border: dotted 1.5px rgba(0, 0, 0, 0.2);
	background-color: initial;
`;

/**
 * Компонент MobilePaymentContract
 */
class MobilePaymentContract extends Component {
	/**
	 * Конструктор
	 * @param {Object} props свойства компонента MobilePaymentContract
	 */
	constructor(props) {
		super(props);

		this.state = {
			phoneNumber: '+79218908064',
			sum: 0,
			commission: 3,
			checked: false,
			dateAutoPay: moment().add(1, 'days').toDate(),
			dateRepeat: 'none'
		};
	}

	/**
	 * Получить цену с учетом комиссии
	 * @returns {Number}
	 */
	getSumWithCommission() {
		const {sum, commission} = this.state;

		const isNumber = !isNaN(parseFloat(sum)) && isFinite(sum);
		if (!isNumber || sum <= 0) {
			return 0;
		}

		return Number(sum) + Number(commission);
	}

	/**
	 * Отправка формы
	 * @param {Event} event событие отправки формы
	 */
	onSubmitForm(event) {
		if (event) {
			event.preventDefault();
		}

		const {sum, phoneNumber, commission, checked, dateAutoPay, dateRepeat} = this.state;

		const isNumber = !isNaN(parseFloat(sum)) && isFinite(sum);
		if (!isNumber || sum === 0) {
			return;
		}

		const {activeCard} = this.props;

		if (checked) {
			const sendData = {
				receiverNumber: phoneNumber,
				sum,
				date: dateAutoPay,
				receiverType: 'phonePayment',
				dateRepeat
			};
			axios
				.post(`/cards/${activeCard.id}/auto-payment`, sendData)
				.then(() => this.props.onPaymentSuccess({sum, phoneNumber, commission, dateAutoPay, dateRepeat}));
		} else {
			axios
				.post(`/cards/${activeCard.id}/pay`, {phoneNumber, sum})
				.then((transaction) => this.props.onPaymentSuccess({
					sum,
					phoneNumber,
					commission,
					id: transaction.data.id
				}));
		}
	}

	/**
	 * Обработка изменения значения в input
	 * @param {Event} event событие изменения значения input
	 */
	onChangeInputValue(event) {
		if (!event) {
			return;
		}

		const {name, value} = event.target;

		this.setState({
			[name]: value
		});
	}

	/**
	 * Обработка изменения значения в switch
	 * @param {Boolean} checked активен ли свитчер
	 */
	onChangeCheckedValue(checked) {
		this.setState({
			checked
		});
	}

	/**
	 * Обработка изменения даты платежа
	 * @param {Moment} dateAutoPay Дата автоплатежа
	 */
	onChangeDateValue(dateAutoPay) {
		dateAutoPay = dateAutoPay.toDate();
		this.setState({
			dateAutoPay
		});
	}

	/**
	 * Обработка изменения дат повтора
	 * @param {String} dateRepeat Дата автоплатежа
	 */
	onChangeSelectValue(dateRepeat) {
		this.setState({
			dateRepeat
		});
	}

	/**
	 * Откличение старых дат
	 * @param {Date} current Выбранная дата платежа
	 */
	disabledDate(current) {
		return current && current.valueOf() < Date.now();
	}

	/**
	 * Рендер компонента
	 *
	 * @override
	 * @returns {JSX}
	 */
	render() {
		const {commission, checked} = this.state;
		const date = moment().add(1, 'days');
		return (
			<MobilePaymentLayout>
				<form onSubmit={(event) => this.onSubmitForm(event)}>
					<MobilePaymentTitle>Пополнить телефон</MobilePaymentTitle>
					<InputField>
						<Label>Телефон</Label>
						<InputPhoneNumber
							name='phoneNumber'
							value={this.state.phoneNumber}
							onChange={(event) => this.onChangeInputValue(event)}/>
					</InputField>
					<InputField>
						<Label>Сумма</Label>
						<InputSum
							name='sum'
							value={this.state.sum}
							onChange={(event) => this.onChangeInputValue(event)} />
						<Currency>₽</Currency>
					</InputField>
					<InputField>
						<Label>Спишется</Label>
						<InputCommision value={this.getSumWithCommission()} />
						<Currency>₽</Currency>
					</InputField>
					<InputField>
						<Label>Автоплатёж</Label>
						<Switch defaultChecked={false} onChange={(checked) => this.onChangeCheckedValue(checked)}/>
					</InputField>
					<InputField>
						<Label>Дата платежа</Label>
						<DatePicker defaultValue={date} locale={locale} disabled={!checked}
									disabledDate={this.disabledDate} onChange={(date) => this.onChangeDateValue(date)}/>
					</InputField>
					<InputField>
						<Label>Повторять платёж</Label>
						<Select defaultValue="none" disabled={!checked}
								onChange={(dateRepeat) => this.onChangeSelectValue(dateRepeat)}>
							<Select.Option value="none">Никогда</Select.Option>
							<Select.Option value="weekly">Еженедельно</Select.Option>
							<Select.Option value="monthly">Ежемесячно</Select.Option>
						</Select>
					</InputField>
					<Commission>Размер коммиссии составляет {commission} ₽</Commission>
					<Underline />
					<PaymentButton bgColor='#fff' textColor='#108051'>Заплатить</PaymentButton>
				</form>
			</MobilePaymentLayout>
		);
	}
}

MobilePaymentContract.propTypes = {
	activeCard: PropTypes.shape({
		id: PropTypes.number
	}).isRequired,
	onPaymentSuccess: PropTypes.func.isRequired
};

export default MobilePaymentContract;
