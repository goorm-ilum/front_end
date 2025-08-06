import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MessagePopup from './MessagePopup';

const AdminMenuLink = ({ to, children, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const isLogin = !!accessToken;
  const normalizedRole = role ? role.toString().trim().toLowerCase() : '';
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || 
                     role === 1 || role === '1' || role === 'ROLE_ADMIN' || role === 'role_admin' ||
                     normalizedRole === 'a' || normalizedRole === 'admin' || normalizedRole === 'role_admin';
  
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const handleClick = (e) => {
    // Home 페이지는 권한 체크 없이 접근 가능
    if (to === '/admin') {
      return; // 기본 링크 동작 허용
    }
    
    // 관리자 권한이 없는 경우
    if (!isLogin || !isAdminRole) {
      e.preventDefault();
      setShowMessagePopup(true);
      return;
    }

    // 같은 페이지를 클릭한 경우 새로고침
    if (location.pathname === to) {
      e.preventDefault();
      window.location.reload();
      return;
    }
  };

  const handleClosePopup = () => {
    setShowMessagePopup(false);
  };

  return (
    <>
      <Link
        to={to}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
      
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={handleClosePopup}
        message="관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요."
        type="warning"
      />
    </>
  );
};

export default AdminMenuLink; 