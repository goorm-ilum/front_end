import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from './api/mainApi';

const FloatingChatIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const isLogin = !!accessToken; // accessToken이 있으면 로그인된 것으로 간주
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
  const isAdminUser = isLogin && isAdminRole;

  // 현재 경로에 따라 채팅 링크 결정
  const getChatLink = () => {
    if (location.pathname.startsWith('/admin') && isAdminUser) {
      return '/admin/chats'; // 관리자 페이지에서는 관리자 채팅
    } else {
      return '/chat'; // 사용자 페이지에서는 일반 채팅
    }
  };

  // 현재 경로에 따라 제목 결정
  const getChatTitle = () => {
    if (location.pathname.startsWith('/admin') && isAdminUser) {
      return '채팅 관리'; // 관리자용 제목
    } else {
      return '채팅 상담'; // 사용자용 제목
    }
  };

  // 안 읽은 메시지 개수 가져오기
  const fetchUnreadCount = async () => {
    try {
      console.log('=== 안 읽은 메시지 개수 API 호출 ===');
      const userId = 'dhrdbs'; // 실제로는 로그인한 사용자 ID를 사용해야 함
      const response = await axiosInstance.get(`/api/chat/countALLUnreadMessages?userId=${userId}`);
      console.log('안 읽은 메시지 개수 응답:', response.data);
      
      if (response.data && response.data.count !== undefined) {
        setUnreadCount(response.data.count);
        console.log('안 읽은 메시지 개수:', response.data.count);
      } else {
        console.log('응답 데이터에 count가 없습니다:', response.data);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('안 읽은 메시지 개수 가져오기 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      // 에러 발생 시 기본값 사용
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 안 읽은 메시지 개수 가져오기
    fetchUnreadCount();
    
    // 주기적으로 안 읽은 메시지 개수 업데이트 (30초마다)
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      to={getChatLink()}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
      title={getChatTitle()}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default FloatingChatIcon; 