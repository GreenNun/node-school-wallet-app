import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'emotion/react';
import axios from 'axios';

import {Island, Title, Button, Input} from './';

const NewCardPaymentLayout = styled(Island)`
	width: 440px;
	background: #108051;
`;

const NewCardPaymentTitle = styled(Title)`
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

const Underline = styled.div`
	height: 1px;
	margin-bottom: 20px;
	background-color: rgba(0, 0, 0, 0.16);
`;

const CreateCardButton = styled(Button)`
	float: right;
	box-shadow: 0 2px 2px rgba(0,0,0,0.5);
`;

const InputCardNumber = styled(Input)`
	width: 225px;
`;

const InputBalance = styled(Input)`
	width: 160px;
`;

/**
 * Компонент MobilePaymentContract
 */
class MakeChildrenCard extends Component {
	/**
	 * Конструктор
	 * @param {Object} props свойства компонента MobilePaymentContract
	 */
	constructor(props) {
		super(props);

		this.state = {
			cardNumber: 0,
			balance: 0,
			login: '',
			success: false
		};
	}

	/**
	 * Отправка формы
	 * @param {Event} event событие отправки формы
	 */
	onSubmitForm(event) {
		if (event) {
			event.preventDefault();
		}

		const {cardNumber, balance, login} = this.state;
		const {activeCard} = this.props;

		const isNumber = !isNaN(parseFloat(balance)) && isFinite(balance);
		if (!isNumber || balance <= 0) {
			return;
		}

		const options = {
			method: 'post',
			url: `/cards/${activeCard.id}/children`,
			data: {
				cardNumber,
				balance,
				login
			}
		};

		axios(options).then(() => this.setState({success: true}));
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
	 * Повторить создание дочерний карты
	 */
	repeatMake() {
		this.setState({
			success: false
		});
	}

	/**
	 * Рендер компонента
	 *
	 * @override
	 * @returns {JSX}
	 */
	render() {
		if (!this.state.success)
			return (
				<NewCardPaymentLayout>
					<form onSubmit={(event) => this.onSubmitForm(event)}>
						<NewCardPaymentTitle>Сделать доченрнюю карту</NewCardPaymentTitle>
						<InputField>
							<Label>Логин</Label>
							<InputCardNumber
								name='login'
								value={this.state.login}
								onChange={(event) => this.onChangeInputValue(event)}/>
						</InputField>
						<InputField>
							<Label>Номер карты</Label>
							<InputCardNumber
								name='cardNumber'
								value={this.state.cardNumber}
								onChange={(event) => this.onChangeInputValue(event)}/>
						</InputField>
						<InputField>
							<Label>Баланс</Label>
							<InputBalance
								name='balance'
								value={this.state.balance}
								onChange={(event) => this.onChangeInputValue(event)}/>
							<Currency>₽</Currency>
						</InputField>
						<Underline/>
						<CreateCardButton bgColor='#fff' textColor='#108051'>Создать</CreateCardButton>
					</form>
				</NewCardPaymentLayout>
			);
		else {
			return (
				<NewCardPaymentLayout>
					<form onSubmit={() => this.repeatMake()}>
						<NewCardPaymentTitle>Дочерняя карта создана!</NewCardPaymentTitle>
						<InputField>
							<Label>Логин</Label>
							<InputCardNumber
								name='login'
								value={this.state.cardNumber}
								readonly={'true'}/>
						</InputField>
						<InputField>
							<Label>Номер карты</Label>
							<InputCardNumber
								name='cardNumber'
								value={this.state.cardNumber}
								readonly={'true'}/>
						</InputField>
						<InputField>
							<Label>Баланс</Label>
							<InputBalance
								name='balance'
								value={this.state.balance}
								readonly={'true'}/>
							<Currency>₽</Currency>
						</InputField>
						<Underline/>
						<CreateCardButton bgColor='#fff' textColor='#108051'>Создать ещё</CreateCardButton>
					</form>
				</NewCardPaymentLayout>
			);
		}
	}
}

MakeChildrenCard.propTypes = {
	activeCard: PropTypes.shape({
		id: PropTypes.number,
		theme: PropTypes.object
	}).isRequired
};

export default MakeChildrenCard;
