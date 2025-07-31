import {getCookie, removeCookie, setCookie} from '../util/cookieUtil';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {loginPost} from '../api/memberApi';

const initState = {
	id : "",
	name : "",
	email : "",
	nickname : "",
	nicknameSet : false,
	isFemale : false,
	role : "",
}

// 쿠키에서 사용자 정보 로드
const loadMemberCookie = () => {
	try {
		const memberCookie = getCookie("member");
		if (!memberCookie) return initState; // 쿠키가 없으면 null 반환

		if (typeof memberCookie === "string") {
			// 문자열인 경우 JSON 파싱
			return JSON.parse(decodeURIComponent(memberCookie));
		} else if (typeof memberCookie === "object") {
			// 객체인 경우 바로 반환
			return memberCookie;
		} else {
			console.warn("Unexpected member cookie format:", memberCookie);
			return initState; // 알 수 없는 형식이면 null 반환
		}
	} catch (error) {
		console.error("Failed to parse member cookie:", error);
		return initState;
	}
};

// 로그인 API 호출 비동기 작업
export const loginPostAsync = createAsyncThunk(
		"loginPostAsync",
		async (param) => {
			const response = await loginPost(param);
			return response;
		},
);

const updateStateAndCookie = (state, payload) => {
	Object.assign(state, initState);

	state.id = payload.id;
	state.name = payload.name;
	state.nickname = payload.nickname;
	state.email = payload.email;
	state.isFemale = payload.isFemale;
	state.nicknameSet = payload.nicknameSet;
	state.role = payload.role;
	state.accessToken = payload.accessToken;
	state.refreshToken = payload.refreshToken;
	state.loginSuccess = true;

	setCookie("member", JSON.stringify(payload), {
		path: "/",
		maxAge: 86400,
	});
};

// Slice 생성
const loginSlice = createSlice({
	name: "LoginSlice",
	initialState: loadMemberCookie() || initState, // 쿠키 데이터가 없으면 초기 상태
	reducers: {
		login: (state, action) => {
			console.log("login...");
			updateStateAndCookie(state, action.payload);
		},

		logout: (state) => {
			console.log("logout...");
			// 상태 초기화
			Object.assign(state, initState);

			// 쿠키 삭제
			removeCookie("member");
		},

		loginSuccess: (state) => {
			state.loginSuccess = true;
		},

		loginFailure: (state) => {
			state.loginSuccess = false;
		},
		setNickname: (state, action) => {
			state.nickname = action.payload;
		},
	},
	

	extraReducers: (builder) => {
		builder
				.addCase(loginPostAsync.fulfilled, (state, action) => {
					console.log("fulfilled"); // 완료
					state.loading = false;
					updateStateAndCookie(state, action.payload);
				})
				.addCase(loginPostAsync.pending, (state) => {
					console.log("pending"); // 처리 중
					state.loading = true;
				})
				.addCase(loginPostAsync.rejected, (state, action) => {
					console.log("rejected", action.error); // 에러
					state.loginSuccess = false; // 로그인 실패 상태 설정
					state.loading = false;
				});
	},
});

// 액션과 리듀서 내보내기
export const { login, logout, loginSuccess, loginFailure, setNickname } = loginSlice.actions;
export default loginSlice.reducer;