import {addAuthHeader, handleAuthError} from '../util/jwtUtil';
import axios from 'axios';

export const API_SERVER_HOST = "http://localhost:8080";

const axiosInstance = axios.create({
	baseURL: API_SERVER_HOST,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 및 응답 인터셉터 등록
axiosInstance.interceptors.request.use(addAuthHeader, (error) =>
		Promise.reject(error),
);

axiosInstance.interceptors.response.use(
		(response) => response,
		handleAuthError, // 응답 에러 처리
);

export default axiosInstance;
