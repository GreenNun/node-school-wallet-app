import React from 'react';
import styled from 'emotion/react';
import PropTypes from 'prop-types';
import {Menu, Dropdown, Icon} from 'antd';

const menu = (
	<Menu>
		<Menu.Item>
			<a target="_blank" rel="noopener noreferrer" href="/users/gettoken">Получить токен</a>
		</Menu.Item>
		<Menu.Item>
			<a rel="noopener noreferrer" href="/users/logout">Выйти</a>
		</Menu.Item>
	</Menu>
);

const User = styled.div`
	display: flex;
	align-items: center;
	font-size: 15px;
	color: #000;
`;

const Avatar = styled.img`
	width: 42px;
	height: 42px;
	border-radius: 50%;
	margin-right: 10px;
`;

const UserInfo = ({user}) => (
	<User>
		<Avatar src='/assets/avatar.png' />
		<Dropdown overlay={menu}>
			<a className="ant-dropdown-link" href="#">
				{`${user.name} ${user.surname}`} <Icon type="down"/>
			</a>
		</Dropdown>
	</User>
);

UserInfo.propTypes = {
	user: PropTypes.shape({
		login: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired
	})
};

export default UserInfo;
