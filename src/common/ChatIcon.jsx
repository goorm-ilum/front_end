import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ChatIcon = () => {
  const location = useLocation();
  // 새 알림 개수 상태 (실제로는 API에서 가져올 수 있음)
  const [notificationCount, setNotificationCount] = useState(1);

  // 채팅 페이지에 들어가면 알림 개수 초기화
  useEffect(() => {
    if (location.pathname === '/chat') {
      setNotificationCount(0);
    }
  }, [location.pathname]);

  return (
    <Link to="/chat" className="relative text-gray-700 hover:text-blue-600 p-2 flex items-center">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {/* 새 알림 표시 */}
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </Link>
  );
};

export default ChatIcon; 