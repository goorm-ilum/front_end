import {createSearchParams, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {login, loginPostAsync, logout, setNickname} from '../slice/loginSlice';

export const useCustomLogin = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const loginState = useSelector((state) => state.loginSlice);

	const isLogin = useSelector((state) => state.loginSlice.accessToken);
	const memberId = useSelector((state) => state.loginSlice.id);
	const nicknameSet = useSelector((state) => state.loginSlice.nicknameSet);
	const nickname = useSelector((state) => state.loginSlice.nickname);

	// 로그인 함수
	const doLogin = async (loginParam) => {
		//----------로그인 함수

		const action = await dispatch(loginPostAsync(loginParam));

		return action.payload;
	};

	// 소셜로그인
	const doSocialLogin = (data) => {
		dispatch(login(data));
	}

	const doLogout = () => {
		//---------------로그아웃 함수

		dispatch(logout());
		window.location.reload();
	};

	const updateNickname = (nickname) => {
		dispatch(setNickname(nickname));
	};

	const moveToPath = (path) => {
		//----------------페이지 이동
		navigate({ pathname: path }, { replace: true });
	};

	const moveToLogin = () => {
		//----------------------로그인 페이지로 이동
		navigate({ pathname: "/member/login" }, { replace: true });
	};

	const exceptionHandle = (ex) => {
		console.log("Exception----------------------");

		console.log(ex);

		const errorMsg = ex.response.data.error;

		const errorStr = createSearchParams({ error: errorMsg }).toString();

		if (errorMsg === "REQUIRE_LOGIN") {
			alert("로그인 해야만 합니다.");
			navigate({ pathname: "/member/login", search: errorStr });
		}

		if (ex.response.data.error === "ERROR_ACCESSDENIED") {
			alert("해당 메뉴를 사용할수 있는 권한이 없습니다.");
			navigate({ pathname: "/member/login", search: errorStr });
		}
	};

	return {
		loginState,
		isLogin,
		memberId,
		nicknameSet,
		nickname,
		doLogin,
		doSocialLogin,
		doLogout,
		updateNickname,
		moveToPath,
		moveToLogin,
		exceptionHandle,
	};
};
