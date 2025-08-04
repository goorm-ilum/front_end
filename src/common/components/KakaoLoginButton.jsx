import axios from 'axios';
import {API_SERVER_HOST} from '../api/mainApi';
import {useCustomLogin} from '../hook/useCustomLogin';

const KakaoLoginButton = () => {

	const {isLogin, doLogout} = useCustomLogin();

	const handleLogin = async () => {
		try {
			// 프록시를 통해 상대 경로로 호출
			const response = await axios.get('/api/member/kakao-login-url');
			console.log(response);
			const data = await response.data;
			window.location.href = data.url; // 카카오 인증 페이지로 이동
		} catch (error) {
			console.error("카카오 로그인 URL 요청 실패", error);
		}
	};

	return <div>
		{!isLogin ? (
				<div>
					<button onClick={handleLogin}
					style={{
						backgroundColor: '#FEE500',
						color: 'black',
						borderRadius: '10px',
						border: 'none',
						padding: '8px 16px',
						fontSize: '16px',
						fontWeight: 'bold',
						cursor: 'pointer',
					}}>로그인</button>
				</div>
		) : (
				<div>
					<button onClick={doLogout}
					style={{
						backgroundColor: 'lightgray',
						color: 'black',
						borderRadius: '10px',
						border: 'none',
						padding: '8px 16px',
						fontSize: '16px',
						fontWeight: 'bold',
						cursor: 'pointer',
						}}>로그아웃</button>
				</div>
		)}

	</div>
};

export default KakaoLoginButton;