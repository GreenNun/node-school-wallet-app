import React from 'react';
import styled from 'emotion/react';

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
		{`${user.name} ${user.surname}`}
	</User>
);

UserInfo.propTypes = {
	user: PropTypes.shape({
		login: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired
	})
};

export default UserInfo;
