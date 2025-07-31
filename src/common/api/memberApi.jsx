import axios from 'axios';
import axiosInstance, {API_SERVER_HOST} from './mainApi';

const host = `${API_SERVER_HOST}/api/member`;

// ✅ 로그인 API
export const loginPost = async (loginParam) => {
	const header = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };

	const form = new URLSearchParams();
	form.append("id", loginParam.id);
	form.append("password", loginParam.password);

	console.log("전송할 데이터:", form.toString());

	try {
		const res = await axios.post(`${host}/login`, form, header);
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (error) {
		console.error("API 호출 실패:", error.response || error.message);
		throw error.response?.data || error;
	}
};

// ✅ 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname, memberId) => {
  const res = await axiosInstance.get(`${API_SERVER_HOST}/api/member/check-nickname`, {
    params: { nickname, memberId }
  });
  return res.data; // { available: true/false }
};

// ✅ 닉네임 저장
export const saveNickname = async (memberId, nickname) => {
  try {
    await axiosInstance.post(`${API_SERVER_HOST}/api/member/nickname`, {
      memberId,
      nickname
    });
  } catch (err) {
    throw new Error(err.response?.data || '닉네임 저장 실패');
  }
};

// ✅ 약관 동의 저장
export const saveAgreements = async (memberId, agreements) => {
  try {
    await axiosInstance.post(`${API_SERVER_HOST}/api/member/agreements`, {
      memberId,
      ...agreements
    });
  } catch (err) {
    throw new Error(err.response?.data || '약관 동의 저장 실패');
  }
};