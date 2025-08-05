import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const isLogin = !!accessToken; // accessToken이 있으면 로그인된 것으로 간주

  console.log('=== AdminProtectedRoute 디버깅 ===');
  console.log('전체 loginSlice 상태:', loginState);
  console.log('accessToken:', accessToken);
  console.log('isLogin:', isLogin);
  console.log('role:', role);
  console.log('role type:', typeof role);
  console.log('role === "A":', role === 'A');
  console.log('role === A (숫자):', role === 'A');
  console.log('role === "A" (문자열):', role === 'A');
  console.log('role 값 확인:', JSON.stringify(role));

  // 로그인하지 않은 경우
  if (!isLogin) {
    console.log('로그인하지 않음 - 로그인 페이지로 리다이렉트');
    alert('관리자 로그인이 필요합니다.');
    return <Navigate to="/member/login" replace />;
  }

  // role 체크 - 여러 형태로 확인
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
  
  if (!isAdminRole) {
    console.log('관리자 권한 없음 - 홈페이지로 리다이렉트');
    console.log('현재 role:', role, '필요한 role: A');
    console.log('isAdminRole:', isAdminRole);
    console.log('role 체크 결과:');
    console.log('- role === "A":', role === 'A');
    console.log('- role === A:', role === 'A');
    console.log('- role === 1:', role === 1);
    alert('관리자 권한이 필요합니다. (role: ' + role + ')');
    return <Navigate to="/" replace />;
  }

  // 권한이 있는 경우 자식 컴포넌트 렌더링
  console.log('관리자 권한 확인됨 - 페이지 렌더링');
  return children;
};

export default AdminProtectedRoute; 