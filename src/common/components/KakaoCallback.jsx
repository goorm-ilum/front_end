import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/mainApi';
import { useCustomLogin } from '../hook/useCustomLogin';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { doSocialLogin } = useCustomLogin();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    // console.log("카카오 로그인 콜백 코드:", code);

    if (code) {
      axiosInstance.post(`/api/member/kakao`, new URLSearchParams({ code }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((res) => {
          const data = res.data;
          // console.log("로그인 유저 정보:", data);

          // 사용자 정보 저장
          doSocialLogin(data);

          // nicknameSet 여부에 따라 리다이렉트 분기
          if (data.nicknameSet === false) {
            navigate('/member/register');
          } else {
            // 로그인 시점의 이전 페이지 URL 확인
            const previousUrl = sessionStorage.getItem('loginRedirectUrl') || '/';
            const isFromAdminPage = previousUrl.startsWith('/admin');
            
            // 관리자이면서 관리자 페이지에서 로그인한 경우에만 관리자 페이지로 이동
            const isAdmin = data.role === 'A' || data.role === 'A' || data.role === 'ADMIN' || data.role === 'admin' || data.role === 1;
            
            if (isAdmin && isFromAdminPage) {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }
        })
        .catch((error) => {
          console.error("카카오 로그인 실패", error);
        });
    }
  }, [navigate, doSocialLogin]);

  return <p>카카오 로그인 중입니다...</p>;
};

export default KakaoCallback;