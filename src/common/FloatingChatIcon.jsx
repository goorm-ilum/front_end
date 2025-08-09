import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from './api/mainApi';
import { Client } from '@stomp/stompjs';

const FloatingChatIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const isLogin = !!accessToken; // accessToken이 있으면 로그인된 것으로 간주
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
  const isAdminUser = isLogin && isAdminRole;
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef(new Set());
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // 현재 경로에 따라 채팅 링크 결정
  const getChatLink = () => {
    if (location.pathname.startsWith('/admin')) {
      return '/admin/chat'; // 관리자 페이지에서는 관리자 채팅
    } else {
      return '/chat'; // 사용자 페이지에서는 일반 채팅
    }
  };

  // 현재 경로에 따라 제목 결정
  const getChatTitle = () => {
    if (location.pathname.startsWith('/admin')) {
      return '채팅 관리'; // 관리자용 제목
    } else {
      return '채팅 상담'; // 사용자용 제목
    }
  };

  // 안 읽은 메시지 개수 가져오기
  const fetchUnreadCount = async () => {
    try {
      console.log('=== 안 읽은 메시지 개수 API 호출 ===');
      const userId = loginState?.id;
      if (!userId) {
        console.log('로그인 사용자 ID가 없어 미읽음 수 조회를 건너뜁니다.');
        setUnreadCount(0);
        return;
      }
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
    const isChatPage = location.pathname.startsWith('/chat') || location.pathname.startsWith('/admin/chat');
    if (!isLogin) return; // 비로그인 시 연결하지 않음

    let isMounted = true;

    const initWebSocket = async () => {
      try {
        const SockJS = (await import('sockjs-client')).default;
        const socket = new SockJS('http://localhost:80/ws', null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        });

        const makeConnectHeaders = () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {});

        const client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: makeConnectHeaders(),
          beforeConnect: () => {
            client.connectHeaders = makeConnectHeaders();
          },
          debug: (msg) => console.log('STOMP ICON DEBUG:', msg),
        });

        client.onConnect = async () => {
          if (!isMounted) return;
          console.log('✅ FloatingChatIcon WebSocket 연결 성공');
          stompClientRef.current = client;
          setIsWebSocketConnected(true);

          // 내 채팅방 목록을 가져와 각 방 토픽을 구독
          try {
            const res = await axiosInstance.get('/api/chat/me/chatRooms');
            const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
            const roomIds = list.map((room) => room.roomId || room.id).filter(Boolean);

            roomIds.forEach((roomId) => {
              try {
                const sub = client.subscribe(`/topic/chat/room/${roomId}`, () => {
                  // 새 메시지 수신 → 총 미읽음 수 재조회
                  fetchUnreadCount();
                });
                subscriptionsRef.current.add(sub);
                console.log('📡 FloatingChatIcon 구독 완료:', `/topic/chat/room/${roomId}`);
              } catch (e) {
                console.error('❌ FloatingChatIcon 구독 실패:', roomId, e);
              }
            });
          } catch (e) {
            console.error('❌ 내 채팅방 목록 조회 실패 (아이콘):', e);
          }
        };

        client.onStompError = (frame) => {
          console.error('❌ FloatingChatIcon STOMP 에러:', frame);
          setIsWebSocketConnected(false);
        };

        client.onDisconnect = () => {
          console.log('❌ FloatingChatIcon WebSocket 연결 해제');
          setIsWebSocketConnected(false);
        };

        client.activate();
      } catch (e) {
        console.error('❌ FloatingChatIcon WebSocket 초기화 실패:', e);
      }
    };

    // 채팅 페이지가 아닐 때만 연결 시작
    if (!isChatPage) {
      initWebSocket();
    }

    return () => {
      isMounted = false;
      // 구독 해제
      subscriptionsRef.current.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (e) {
          // ignore
        }
      });
      subscriptionsRef.current.clear();

      // 클라이언트 비활성화
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate();
        } catch (e) {
          // ignore
        }
      }
      setIsWebSocketConnected(false);
    };
  }, [isLogin, accessToken, location.pathname]);

  // 미읽음 수는 채팅 페이지 여부와 상관없이 조회 (로그 확인 목적 포함)
  useEffect(() => {
    if (!isLogin) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount();
  }, [isLogin, accessToken]);

  // 비로그인 또는 chat/admin/chat 페이지에서는 아이콘 숨김
  if (!isLogin || location.pathname.startsWith('/chat') || location.pathname.startsWith('/admin/chat')) {
    return null;
  }

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