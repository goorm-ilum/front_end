import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FloatingChatIcon = () => {
  const [unreadCount, setUnreadCount] = useState(3); // 예시로 3개 설정

  // 실제로는 API에서 안 읽은 메시지 수를 가져와야 합니다
  useEffect(() => {
    // 여기서 API 호출하여 안 읽은 메시지 수를 가져옵니다
    // setUnreadCount(response.data.unreadCount);
  }, []);

  return (
    <Link
      to="/chat"
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50 relative"
      title="채팅 상담"
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