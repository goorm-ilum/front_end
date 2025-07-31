import { Cookies } from "react-cookie";

const cookies = new Cookies();

// 쿠키 저장 (JSON 문자열로 저장)
export const setCookie = (name, value, options = {}) => {
	const { path = "/", maxAge } = options;

	// 객체 데이터를 JSON 문자열로 변환
	const serializedValue =
			typeof value === "object" ? JSON.stringify(value) : value;

	cookies.set(name, serializedValue, {
		path,
		maxAge,
	});
};

// 쿠키 가져오기 (JSON 문자열 파싱)
export const getCookie = (name) => {
	const cookieValue = cookies.get(name);

	// JSON 문자열 파싱 시도
	try {
		return JSON.parse(cookieValue);
	} catch {
		return cookieValue; // 파싱 실패 시 원래 값 반환
	}
};

// 쿠키 제거
export const removeCookie = (name, path = "/") => {
	cookies.remove(name, { path });
};