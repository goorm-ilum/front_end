import axiosInstance from '../api/mainApi';
import {useCustomLogin} from '../hook/useCustomLogin';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const KakaoLoginButton = () => {
	const {isLogin, doLogout} = useCustomLogin();
	const location = useLocation();
	const loginState = useSelector((state) => state.loginSlice);
	const { accessToken, role } = loginState;
	
	// 관리자 페이지인지 확인
	const isAdminPage = location.pathname.startsWith('/admin');
	
	// 관리자 권한 확인
	const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
	
	// 관리자 페이지에서는 관리자 권한이 있는 경우에만 로그인된 것으로 간주
	const shouldShowLogout = isAdminPage ? (isLogin && isAdminRole) : isLogin;

	const handleLogin = async () => {
		try {
			// 현재 페이지 URL을 sessionStorage에 저장
			sessionStorage.setItem('loginRedirectUrl', window.location.pathname);
			
			// 프록시를 통해 상대 경로로 호출
			const response = await axiosInstance.get('/api/member/kakao-login-url');
			console.log(response);
			const data = await response.data;
			window.location.href = data.url; // 카카오 인증 페이지로 이동
		} catch (error) {
			console.error("카카오 로그인 URL 요청 실패", error);
		}
	};

	return <div>
		{!shouldShowLogout ? (
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