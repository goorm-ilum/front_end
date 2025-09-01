// src/common/chat/ChatPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation, useMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance, { API_SERVER_HOST } from '../api/mainApi';  // mainApi의 axiosInstance 사용
import ChatRoom from './ChatRoom';
import { Client } from '@stomp/stompjs';
import { getCookie } from '../util/cookieUtil';
import { 
  saveFailedMessage, 
  getFailedMessagesByRoom, 
  removeFailedMessage, 
  updateFailedMessage,
  incrementRetryCount,
  cleanupOldFailedMessages 
} from '../util/failedMessageUtil';

// 더미 채팅방 목록 (더 많은 데이터 추가)
const dummyRooms = [
  { id: 'room1', title: '고객 A님 문의', lastMessage: '안녕하세요!', updatedAt: '2024-06-10', notReadMessageCount: 2 },
  
];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const adminMatch = useMatch('/admin/chat/:roomId');
  const userMatch = useMatch('/chat/:roomId');
  const nestedRoomId = adminMatch?.params?.roomId || userMatch?.params?.roomId || null;
  const effectiveRoomId = nestedRoomId || roomId || null;
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const currentUserEmail = loginState?.email || getCookie('member')?.email || '';
  const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
  const emailsEqual = (a, b) => normalizeEmail(a) === normalizeEmail(b);
  const isLogin = !!accessToken; // accessToken이 있으면 로그인된 것으로 간주
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
  const isAdminUser = isLogin && isAdminRole;
  const [rooms, setRooms] = useState([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false); // WebSocket 연결 상태
  const [failedMessages, setFailedMessages] = useState([]); // 실패한 메시지들
  const [currentRoomInfo, setCurrentRoomInfo] = useState(null); // 현재 선택된 채팅방 정보
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef(new Set());
  const isSubscriptionSetupRef = useRef(false); // 구독 설정 완료 플래그
  const chatRoomUpdateCallbackRef = useRef(null); // ChatRoom 업데이트 콜백
  const sendMessageCallbackRef = useRef(null); // ChatRoom에서 메시지 전송 요청 콜백

  // 날짜를 yyyy-mm-dd 형식으로 변환하는 함수
  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    
    console.log('🔍 ChatPage formatDate 입력값:', dateInput, '타입:', typeof dateInput);
    
    try {
      let date;
      
      // Date 객체인 경우
      if (dateInput instanceof Date) {
        console.log('📅 Date 객체 감지');
        date = dateInput;
      }
      // 배열 형태인 경우 (예: [2025, 8, 6, ...])
      else if (Array.isArray(dateInput)) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds); // 반드시 month - 1
      }
      // 콤마로 구분된 문자열인 경우 (예: "2025,8,7,16,59,9")
      else if (typeof dateInput === 'string' && dateInput.includes(',')) {
        console.log('📋 콤마 구분 문자열 감지:', dateInput);
        const parts = dateInput.split(',').map(part => parseInt(part.trim()));
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = parts;
        // 월은 0부터 시작하므로 1을 빼줌
        date = new Date(year, month - 1, day, hours, minutes, seconds);
      }
      // 타임스탬프 숫자인 경우 (13자리 밀리초 또는 10자리 초)
      else if (typeof dateInput === 'number') {
        console.log('🔢 숫자 타임스탬프 감지:', dateInput);
        // 10자리면 초 단위이므로 1000을 곱해서 밀리초로 변환
        const timestamp = dateInput.toString().length === 10 ? dateInput * 1000 : dateInput;
        date = new Date(timestamp);
      }
      // 문자열 숫자인 경우 (예: "1736939200000")
      else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
        console.log('🔢 문자열 타임스탬프 감지:', dateInput);
        const timestamp = parseInt(dateInput);
        // 10자리면 초 단위이므로 1000을 곱해서 밀리초로 변환
        const finalTimestamp = dateInput.length === 10 ? timestamp * 1000 : timestamp;
        date = new Date(finalTimestamp);
      }
      // 일반 문자열 날짜인 경우
      else {
        //console.log('📝 일반 문자열 날짜 감지:', dateInput);
        date = new Date(dateInput);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn('❌ 유효하지 않은 날짜:', dateInput);
        return String(dateInput); // 파싱 실패 시 문자열로 반환
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day}`;
      //console.log('✅ ChatPage 날짜 변환 성공:', dateInput, '→', formatted);
      return formatted;
    } catch (error) {
      console.warn('❌ ChatPage 날짜 시간 형식 변환 실패:', dateInput, error);
      return String(dateInput); // 에러 시 문자열로 반환
    }
  };

  // 실패한 메시지 초기화 및 정리
  useEffect(() => {
    // 페이지 로드 시 오래된 실패한 메시지 정리
    cleanupOldFailedMessages();
    
    // 현재 방의 실패한 메시지들 로드
    if (effectiveRoomId) {
      const roomFailedMessages = getFailedMessagesByRoom(effectiveRoomId);
      setFailedMessages(roomFailedMessages);
      console.log('📋 현재 방의 실패한 메시지들 로드:', roomFailedMessages);
    }
  }, [effectiveRoomId]);

  // 채팅방이 변경될 때 currentRoomInfo 초기화
  useEffect(() => {
    if (effectiveRoomId) {
      setCurrentRoomInfo(null);
      console.log(`🔄 채팅방 변경 감지 - ${effectiveRoomId}로 currentRoomInfo 초기화`);
    }
  }, [effectiveRoomId]);

  // 웹소켓 연결 및 구독 설정
  useEffect(() => {
    console.log('🔄 WebSocket 초기화 시작');
    
    const initWebSocket = async () => {
      try {
        // 네이티브 WebSocket을 사용해 SockJS info(401) 없이 바로 연결
        const wsBase = API_SERVER_HOST.replace(/\/$/, '').replace(/^http/, 'ws');
        const brokerWsUrl = `${wsBase}/ws/websocket`;
        console.log('🔄 WebSocket 생성 중... URL:', brokerWsUrl);
        const socketFactory = () => {
          const socket = new WebSocket(brokerWsUrl);
          socket.onopen = () => {
            console.log('✅ WebSocket 연결 성공');
          };
          socket.onclose = (event) => {
            console.log('❌ WebSocket 연결 닫힘:', event.code, event.reason);
          };
          socket.onerror = (error) => {
            console.error('❌ WebSocket 에러:', error);
          };
          return socket;
        };
        console.log('✅ WebSocket 팩토리 준비 완료');
        
        console.log('🔄 STOMP 클라이언트 생성 중...');
        const getAccessToken = () => {
          try {
            const localToken = window.localStorage?.getItem('accessToken');
            if (localToken) return localToken;
          } catch (_) {}
          if (accessToken) return accessToken;
          const member = getCookie('member');
          if (member && member.accessToken) return member.accessToken;
          return null;
        };

        const makeConnectHeaders = () => {
          const token = getAccessToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        };

        const client = new Client({
          webSocketFactory: socketFactory,
          // brokerURL를 사용하지 않고 webSocketFactory로 직접 WebSocket 사용
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: makeConnectHeaders(),
          beforeConnect: () => {
            client.connectHeaders = makeConnectHeaders();
          },
          debug: (msg) => console.log('STOMP DEBUG:', msg),
        });
        console.log('✅ STOMP 클라이언트 생성 완료');

        client.onConnect = () => {
          console.log('✅ ChatPage WebSocket 연결 성공');
          console.log('✅ 클라이언트 연결 상태:', client.connected);
          stompClientRef.current = client;
          setIsWebSocketConnected(true); // 연결 상태 업데이트
          console.log('✅ isWebSocketConnected 상태 업데이트됨: true');
          
          // 테스트용 하드코딩 구독 (현재 채팅방이 있는 경우)
          if (effectiveRoomId) {
            console.log(`🔧 테스트용 직접 구독 시작: /topic/chat/room/${effectiveRoomId}`);
            try {
              const testSubscription = client.subscribe(`/topic/chat/room/${effectiveRoomId}`, (message) => {
                console.log(`🔧 테스트 구독으로 메시지 수신 (/topic/chat/room/${effectiveRoomId}):`, message.body);
                try {
                  const testMessage = JSON.parse(message.body);
                  console.log(`🔧 테스트 파싱된 메시지:`, testMessage);
                } catch (error) {
                  console.error(`🔧 테스트 파싱 실패:`, error);
                }
              });
              console.log(`🔧 테스트 구독 성공: /topic/chat/room/${effectiveRoomId}`);
            } catch (error) {
              console.error(`🔧 테스트 구독 실패:`, error);
            }
          }
        };

        client.onStompError = (frame) => {
          console.error('❌ ChatPage STOMP 에러:', frame);
          console.error('❌ 에러 프레임 상세:', frame.headers);
          console.error('❌ 에러 바디:', frame.body);
          setIsWebSocketConnected(false); // 에러 시 연결 상태 false
          console.log('❌ isWebSocketConnected 상태 업데이트됨: false (에러)');
        };

        client.onDisconnect = () => {
          console.log('❌ ChatPage WebSocket 연결 해제');
          setIsWebSocketConnected(false); // 연결 해제 시 상태 false
          console.log('❌ isWebSocketConnected 상태 업데이트됨: false (연결해제)');
        };

        console.log('🔄 STOMP 클라이언트 활성화 중...');
        client.activate();
        console.log('✅ STOMP 클라이언트 활성화 완료 (연결 대기 중)');
      } catch (error) {
        console.error('❌ ChatPage WebSocket 초기화 실패:', error);
        console.error('❌ 초기화 실패 상세:', error.stack);
        setIsWebSocketConnected(false);
        console.log('❌ isWebSocketConnected 상태 업데이트됨: false (초기화실패)');
      }
    };

    initWebSocket();

    return () => {
      // 기존 구독들 해제
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
      
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      
      setIsWebSocketConnected(false); // cleanup 시 연결 상태 false
    };
  }, []);

  // 메시지를 받았을 때 그 방만 다시 불러오기
  const updateSingleRoom = async (roomId) => {
    try {
      console.log(`🔄 채팅방 ${roomId} 업데이트 시작`);
      const res = await axiosInstance.get(`/api/chat/me/chatRooms/${roomId}`);
      console.log(`📨 채팅방 ${roomId} 업데이트 응답:`, res.data);
      
      setRooms(prev => 
        prev.map(r => {
          if (r.id === roomId) {
            console.log(`🔄 채팅방 ${roomId} 업데이트 완료:`, res.data);
            return { ...r, ...res.data };
          }
          return r;
        })
      );
    } catch (error) {
      console.error(`❌ 채팅방 ${roomId} 업데이트 실패:`, error);
    }
  };

  // ChatRoom에서 요청한 메시지 전송 처리
  const handleSendMessage = (messageDto) => {
    console.log('📨 ChatPage에서 ChatMessageRequestDto 전송 처리:', messageDto);
    console.log('📨 필수 필드 확인:', {
      roomId: messageDto.roomId,
      message: messageDto.message,
      //sender: messageDto.sender
    });
    console.log('🔍 WebSocket 연결 상태:', isWebSocketConnected);
    console.log('🔍 stompClient 존재 여부:', !!stompClientRef.current);
    console.log('🔍 stompClient 연결 상태:', stompClientRef.current?.connected);
    console.log('🔍 stompClient 활성화 상태:', stompClientRef.current?.active);
    console.log('🔍 stompClient 상태 상세:', stompClientRef.current?.state);
    
    // 연결 상태 재확인
    if (stompClientRef.current) {
      console.log('🔍 STOMP 클라이언트 상세 정보:');
      console.log('  - connected:', stompClientRef.current.connected);
      console.log('  - active:', stompClientRef.current.active);
      console.log('  - state:', stompClientRef.current.state);
      console.log('  - 웹소켓 readyState:', stompClientRef.current.webSocket?.readyState);
    }
    
    if (isWebSocketConnected && stompClientRef.current && stompClientRef.current.connected) {
      try {
        //cmd: SEND 프레임 전송 ,실제 SEND 프레임 전송은 ChatPage.jsx에서 이뤄집니다:
        console.log('📨 ChatPage WebSocket 전송 시도:', messageDto);
        console.log('📨 전송 destination: /app/chat/message');
        console.log('📨 전송 body:', JSON.stringify(messageDto));
        // cmd: SEND 프레임 전송
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(messageDto),
          headers: { 'content-type': 'application/json' },
        });
        
        console.log('✅ ChatPage WebSocket 메시지 전송 완료');
        return { success: true };
        
      } catch (error) {
        console.error('❌ ChatPage WebSocket 전송 실패:', error);
        console.error('❌ 전송 실패 상세:', error.stack);
        
        // 클라이언트 측 전송 실패 시 즉시 실패 메시지 저장
        const failedMessageId = saveFailedMessage(messageDto, error.message || '클라이언트 전송 실패');
        if (failedMessageId && String(messageDto.roomId) === String(effectiveRoomId)) {
          const updatedFailedMessages = getFailedMessagesByRoom(effectiveRoomId);
          setFailedMessages(updatedFailedMessages);
        }
        
        return { success: false, error };
      }
    } else {
      console.warn('⚠️ ChatPage WebSocket이 연결되지 않아서 전송 실패');
      console.warn('⚠️ 연결 상태 분석:');
      console.warn('  - isWebSocketConnected:', isWebSocketConnected);
      console.warn('  - stompClient 존재:', !!stompClientRef.current);
      console.warn('  - stompClient.connected:', stompClientRef.current?.connected);
      console.warn('  - stompClient.active:', stompClientRef.current?.active);
      console.warn('  - stompClient.state:', stompClientRef.current?.state);
      
      // WebSocket 연결 실패 시 즉시 실패 메시지 저장
      const failedMessageId = saveFailedMessage(messageDto, 'WebSocket 연결 없음');
      if (failedMessageId && String(messageDto.roomId) === String(effectiveRoomId)) {
        const updatedFailedMessages = getFailedMessagesByRoom(effectiveRoomId);
        setFailedMessages(updatedFailedMessages);
      }
      
      // 재연결 시도
      if (stompClientRef.current && !stompClientRef.current.connected && stompClientRef.current.active) {
        console.log('🔄 WebSocket 재연결 시도...');
        try {
          stompClientRef.current.activate();
        } catch (reconnectError) {
          console.error('❌ 재연결 실패:', reconnectError);
        }
      }
      
      return { success: false, error: 'WebSocket not connected' };
    }
  };

  // 실패한 메시지 재전송 함수
  const handleRetryMessage = (failedMessageId, roomId, message) => {
    // 새로운 인자로 받은 정보를 우선 사용, 없으면 기존 방식으로 찾기
    let failedMessage;
    if (roomId && message) {
      failedMessage = failedMessages.find(msg => 
        msg.id === failedMessageId || 
        (msg.roomId === roomId && msg.message === message)
      );
    } else {
      failedMessage = failedMessages.find(msg => msg.id === failedMessageId);
    }
    
    if (!failedMessage) {
      console.error('❌ 재전송할 메시지를 찾을 수 없음:', failedMessageId, roomId, message);
      return;
    }

    // 재전송 횟수 확인 (3회 이상이면 포기)
    if ((failedMessage.retryCount || 0) >= 3) {
      console.warn('⚠️ 재전송 횟수 초과:', failedMessage);
      updateFailedMessage(failedMessageId, { status: 'abandoned' });
      return;
    }

    console.log('🔄 메시지 재전송 시도:', failedMessage);
    
    // 상태를 재전송 중으로 변경
    updateFailedMessage(failedMessageId, { status: 'retrying' });
    setFailedMessages(getFailedMessagesByRoom(effectiveRoomId));

    // 원본 메시지 데이터로 재전송
    const messageDto = {
      roomId: failedMessage.roomId,
      message: failedMessage.message,
      sender: failedMessage.sender
    };

    const result = handleSendMessage(messageDto);
    
    if (result && result.success) {
      // 재전송 성공 시 실패 목록에서 제거
      removeFailedMessage(failedMessageId);
      setFailedMessages(getFailedMessagesByRoom(effectiveRoomId));
      console.log('✅ 메시지 재전송 성공:', failedMessageId);
    } else {
      // 재전송 실패 시 가만히 둠 (에러 큐에서 처리됨)
      console.log('🔄 재전송 실패 - 에러 큐에서 처리 대기:', failedMessageId);
    }
  };

  // 실패한 메시지 삭제 (포기)
  const handleAbandonMessage = (failedMessageId) => {
    // 쿠키에서 완전히 삭제
    removeFailedMessage(failedMessageId);
    
    // UI에서도 즉시 제거
    setFailedMessages(getFailedMessagesByRoom(effectiveRoomId));
    
    console.log('🗑️ 실패한 메시지 완전 삭제 (쿠키 + UI):', failedMessageId);
  };

  // ChatRoom에서 받은 채팅방 정보로 rooms 업데이트
  const handleRoomInfoUpdate = (roomInfo) => {
    console.log('📥 ChatRoom에서 받은 채팅방 정보:', roomInfo);
    
    if (roomInfo && roomInfo.id) {
      // 현재 선택된 채팅방 정보 업데이트
      setCurrentRoomInfo(roomInfo);
      
      // rooms 목록도 업데이트
      setRooms(prev => prev.map(room => {
        // roomId나 id로 매칭
        if (String(room.id) === String(roomInfo.id) || 
            String(room.roomId) === String(roomInfo.id) ||
            String(room.id) === String(roomInfo.roomId)) {
          
          console.log('🔄 채팅방 정보 업데이트:', {
            기존: { id: room.id, title: room.title },
            새로운: { id: roomInfo.id, title: roomInfo.title }
          });
          
          return {
            ...room,
            title: roomInfo.title || room.title,
            lastMessage: roomInfo.lastMessage || room.lastMessage,
            updatedAt: formatDate(roomInfo.updatedAt || room.updatedAt),
            notReadMessageCount: roomInfo.notReadMessageCount || room.notReadMessageCount || 0
          };
        }
        return room;
      }));
    }
  };

  // 웹소켓 구독 설정 함수 (WebSocket 연결 완료 후 실행)
  const setupWebSocketSubscriptions = useCallback(() => {
    if (!stompClientRef.current) {
      console.log('⚠️ WebSocket 클라이언트가 없어서 구독 설정 건너뜀');
      return;
    }

    if (!isWebSocketConnected) {
      console.log('⚠️ WebSocket이 연결되지 않아서 구독 설정 건너뜀');
      return;
    }

    console.log('🔄 웹소켓 구독 설정 시작');
    console.log('🔄 현재 rooms 길이:', rooms.length);
    console.log('🔄 rooms 상세:', rooms.map(r => ({ id: r.id, roomId: r.roomId, title: r.title })));
    console.log('🔄 WebSocket 연결 상태:', isWebSocketConnected);
    console.log('🔄 STOMP 클라이언트 상태:', stompClientRef.current?.connected);
    
    // 기존 구독들 해제
    console.log('🔄 기존 구독 해제 시작, 현재 구독 수:', subscriptionsRef.current.size);
    subscriptionsRef.current.forEach(subscription => {
      try {
        subscription.unsubscribe();
        console.log('✅ 구독 해제 완료');
      } catch (error) {
        console.error('❌ 구독 해제 실패:', error);
      }
    });
    subscriptionsRef.current.clear();
    console.log('🔄 모든 구독 해제 완료');
    
    // 새로운 채팅방들에 대한 구독 추가
    rooms.forEach(room => {
        
        // 채팅 메시지 토픽 구독 (lastMessage 업데이트용) - ChatRoom.jsx와 동일한 토픽
        console.log(`📡 구독 시작 1111- room.id: ${room.id}, room.roomId: ${room.roomId}`);
        console.log(`📡 구독할 토픽: /topic/chat/room/${room.id}`);
        console.log(`📡 STOMP 클라이언트 연결 상태:`, stompClientRef.current?.connected);
        
        try {
          // 채팅방 메시지 구독
          console.log(`📡 채팅방 메시지 구독 시작 - /topic/chat/room/${room.id}`);
          console.log(`📡 STOMP 클라이언트 상태:`, {
            connected: stompClientRef.current?.connected,
            active: stompClientRef.current?.active,
            state: stompClientRef.current?.state
          });
          
          const messageSubscription = stompClientRef.current.subscribe(`/topic/chat/room/${room.id}`, (message) => {
            try {
              const payload = JSON.parse(message.body || '{}');
              console.log('📨 채팅방 메시지 수신:', payload);
              
              // ChatMessagePush 구조에 맞게 필드 매핑
              const msgRoomId = payload.roomId || room.id;
              const senderEmail = payload.sender || payload.accountEmail || '';
              const messageText = payload.message || '';
              const createdAt = payload.createdAt || Date.now();
              const messageId = payload.messageId || '';

              const unified = {
                roomId: msgRoomId,
                accountEmail: senderEmail,
                senderName: payload.senderName || senderEmail?.split('@')[0] || '알 수 없음',
                message: String(messageText),
                createdAt,
                messageId,
                notReadMessageCount: 0, // 채팅방 메시지는 unread 관리 안함 (개인 큐에서 처리)
              };

              console.log('📨 통합된 메시지 객체:', unified);

              // 현재 보고 있는 채팅방이면 ChatRoom으로 전달하여 append
              console.log('🔍 메시지 전달 조건 확인:', {
                unifiedRoomId: unified.roomId,
                currentRoomId: roomId,
                effectiveRoomId,
                roomIdFromParams: room.id,
                isMatch: String(unified.roomId) === String(roomId) || String(unified.roomId) === String(effectiveRoomId),
                hasCallback: !!chatRoomUpdateCallbackRef.current
              });
              
              if (chatRoomUpdateCallbackRef.current && 
                  (String(unified.roomId) === String(roomId) || 
                   String(unified.roomId) === String(effectiveRoomId) ||
                   String(unified.roomId) === String(room.id))) {
                console.log('✅ ChatRoom으로 메시지 전달:', unified);
                chatRoomUpdateCallbackRef.current(unified);
              } else {
                console.log('❌ 메시지 전달 조건 불만족');
              }

              // 사이드바 업데이트는 개인 큐(/user/queue/chat/rooms)에서 처리
            } catch (e) {
              console.error('❌ 메시지 구독 파싱 실패:', e, message?.body);
            }
          });
        
        console.log(`✅ 메시지 구독 성공: /topic/chat/room/${room.id}`);
        console.log(`📡 구독 객체:`, messageSubscription);
        console.log(`📡 구독 destination:`, messageSubscription.destination);
        subscriptionsRef.current.add(messageSubscription);
        
        } catch (subscribeError) {
          console.error(`❌ 메시지 구독 실패 (/topic/chat/room/${room.id}):`, subscribeError);
        }
        
        // room.roomId가 있으면 추가로 구독
        if (room.roomId && room.roomId !== room.id) {
          const additionalMessageSubscription = stompClientRef.current.subscribe(`/topic/chat/room/${room.roomId}`, (message) => {

            const chatMessage = JSON.parse(message.body);
            console.log("🔍 받은 메시지 전체:", chatMessage);
            console.log("🧩 키 목록:", Object.keys(chatMessage));
            Object.entries(chatMessage).forEach(([key, value]) => {
              console.log(`🔑 ${key}:`, value, `(타입: ${typeof value})`);
            });

            console.log(`=== 📨 ChatPage 추가 구독 WebSocket 메시지 수신 시작 (/topic/chat/room/${room.roomId}) ===`);
            console.log(`📨 추가 구독 - 원본 메시지 객체:`, message);
            console.log(`📨 추가 구독 - 메시지 바디 (raw):`, message.body);
            console.log(`📨 추가 구독 - 메시지 헤더:`, message.headers);
            console.log(`📨 추가 구독 - 메시지 명령:`, message.command);
            
            try {
              const chatMessage = JSON.parse(message.body);
              console.log(`📨 추가 구독 - 파싱된 메시지1 (ChatPage):`, chatMessage);
              console.log(`📨 추가 구독 - 파싱된 메시지1 JSON:`, JSON.stringify(chatMessage, null, 2));
              console.log(`📨 추가 구독 - 키들:`, Object.keys(chatMessage));
              console.log(`📨 추가 구독 - 키 개수:`, Object.keys(chatMessage).length);
              console.log(`📨 추가 구독 - 메시지 내용:`, chatMessage.message);
              console.log(`📨 추가 구독 - 메시지 roomId:`, chatMessage.roomId);
              console.log(`📨 추가 구독 - 메시지 memberId:`, chatMessage.memberId);
              console.log(`📨 추가 구독 - 메시지 unreadCount:`, chatMessage.unreadCount);
              console.log(`📨 추가 구독 - 메시지 updatedAt:`, chatMessage.updatedAt);
              console.log(`=== 추가 구독 - 백엔드에서 보낸 모든 필드 확인 ===`);
              for (const [key, value] of Object.entries(chatMessage)) {
                console.log(`📨 추가 구독 - 필드 ${key}:`, value, `(타입: ${typeof value})`);
              }
            } catch (error) {
              console.error(`❌ 추가 구독 - 메시지 파싱 실패:`, error);
              console.error(`❌ 추가 구독 - 파싱 실패한 원본 데이터:`, message.body);
            }
            
            console.log(`=== 📨 ChatPage 추가 구독 WebSocket 메시지 수신 완료 (/topic/chat/room/${room.roomId}) ===`);
          });
          
          subscriptionsRef.current.add(additionalMessageSubscription);
        }
        
        console.log(`📡 채팅방 ${room.id} 메시지 구독 완료`);
      });

      // 개인별 사이드바 업데이트 큐 구독 (한 번만 구독)
      try {
        const personalQueueDest = `/user/queue/chat/rooms`;
        const personalUpdateSub = stompClientRef.current.subscribe(personalQueueDest, (message) => {
          try {
            const payload = JSON.parse(message.body || '{}');
            console.log('📨 개인 큐 메시지 수신:', payload);
            
            const text = payload.message ?? payload.content ?? payload.lastMessage ?? payload.msg ?? payload.text ?? '';
            const chatMessage = {
              roomId: payload.roomId,
              accountEmail: payload.senderAccountEmail || payload.accountEmail || payload.sender || '',
              senderName: payload.senderName || payload.memberName || payload.name || (payload.senderAccountEmail || payload.accountEmail)?.split('@')[0] || '알 수 없음',
              message: String(text),
              createdAt: payload.createdAt || payload.updatedAt || Date.now(),
              messageId: payload.messageId,
            };

            // 현재 보고 있는 방이면 ChatRoom으로 전달
            if (chatRoomUpdateCallbackRef.current && String(chatMessage.roomId) === String(roomId)) {
              chatRoomUpdateCallbackRef.current(chatMessage);
            }

            // 사이드바 목록 최신화
            if (chatMessage.message && chatMessage.roomId) {
              // 백엔드에서 이미 개인별로 계산된 unread 수 사용
              const effectiveUnread = payload.unreadCountForReceiver ?? 0;

              setRooms(prev => prev.map(r => (
                (String(r.id) === String(chatMessage.roomId) || String(r.roomId) === String(chatMessage.roomId))
                  ? {
                      ...r,
                      lastMessage: chatMessage.message,
                      updatedAt: formatDate(chatMessage.createdAt),
                      notReadMessageCount: effectiveUnread,
                    }
                  : r
              )).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            }
          } catch (e) {
            console.error('❌ 개인 큐 구독 파싱 실패:', e, message?.body);
          }
        });
        subscriptionsRef.current.add(personalUpdateSub);
        console.log(`✅ 개인 큐 구독 성공: ${personalQueueDest}`);
      } catch (e) {
        console.error('❌ 개인 큐 구독 실패:', e);
      }

      // 에러 큐 구독 (메시지 전송 실패 처리)
      try {
        const errorQueueDest = `/user/queue/errors`;
        const errorQueueSub = stompClientRef.current.subscribe(errorQueueDest, (message) => {
          try {
            const errorPayload = JSON.parse(message.body || '{}');
            console.log('❌ 실패 메시지 수신: /user/queue/errors');
            console.log('❌ 에러 큐 메시지 상세:', errorPayload);
            
            // 새로운 에러 응답 구조 처리
            const originalMessage = errorPayload.originalMessage || {};
            const errorMessage = errorPayload.error || '알 수 없는 오류';
            const errorCode = errorPayload.errorCode || 'UNKNOWN_ERROR';
            const details = errorPayload.details || '';
            const failedAt = errorPayload.failedAt || new Date().toISOString();
            
            console.log('❌ 에러 정보 분석:', {
              originalMessage,
              errorMessage,
              errorCode,
              details,
              failedAt
            });
            
            if (originalMessage.roomId) {
              // 기존 실패한 메시지가 있는지 확인 (재전송 실패인지 확인)
              const existingFailedMessages = getFailedMessagesByRoom(originalMessage.roomId);
              const existingFailedMessage = existingFailedMessages.find(msg => 
                msg.message === originalMessage.message && 
                msg.roomId === originalMessage.roomId
              );
              
              if (existingFailedMessage) {
                // 재전송 실패인 경우 - 재시도 횟수 증가
                const newRetryCount = incrementRetryCount(existingFailedMessage.id);
                console.log('🔄 재전송 실패 - 재시도 횟수 증가:', newRetryCount);
                
                // 현재 방의 실패한 메시지 목록 업데이트
                if (String(originalMessage.roomId) === String(effectiveRoomId)) {
                  const updatedFailedMessages = getFailedMessagesByRoom(effectiveRoomId);
                  setFailedMessages(updatedFailedMessages);
                  console.log('🔄 재전송 실패 메시지 목록 업데이트:', updatedFailedMessages);
                }
              } else {
                // 새로운 실패인 경우 - 새로 저장
                const failedMessageId = saveFailedMessage(originalMessage, `${errorMessage} (${errorCode})`);
                
                if (failedMessageId) {
                  // 현재 방의 실패한 메시지 목록 업데이트
                  if (String(originalMessage.roomId) === String(effectiveRoomId)) {
                    const updatedFailedMessages = getFailedMessagesByRoom(effectiveRoomId);
                    setFailedMessages(updatedFailedMessages);
                    console.log('🔄 새로운 실패 메시지 목록 업데이트:', updatedFailedMessages);
                  }
                }
              }
              
              // 사용자에게 상세 알림 표시
              console.warn('⚠️ 메시지 전송 실패:', {
                message: errorMessage,
                code: errorCode,
                details: details,
                roomId: originalMessage.roomId,
                failedAt: failedAt
              });
            } else {
              console.error('❌ 원본 메시지 정보가 없음:', errorPayload);
            }
          } catch (e) {
            console.error('❌ 에러 큐 구독 파싱 실패:', e, message?.body);
          }
        });
        subscriptionsRef.current.add(errorQueueSub);
        console.log(`✅ 에러 큐 구독 성공: ${errorQueueDest}`);
      } catch (e) {
        console.error('❌ 에러 큐 구독 실패:', e);
      }
      
      // 구독 설정 완료 플래그 설정
      console.log('🔄 웹소켓 구독 설정 완료');
      console.log('🔄 총 구독 수:', subscriptionsRef.current.size);
      console.log('🔄 구독된 토픽들:', Array.from(subscriptionsRef.current).map(sub => sub.destination || 'unknown'));
  }, [rooms, isWebSocketConnected]); // rooms와 연결 상태 의존성 필요

  // WebSocket 연결 완료 후 구독 설정
  useEffect(() => {
    if (isWebSocketConnected && rooms.length > 0) {
      console.log('🔄 WebSocket 연결 완료 후 구독 설정 시작');
      setupWebSocketSubscriptions();
    }
  }, [isWebSocketConnected, rooms.length, setupWebSocketSubscriptions]);

  // 방 제목은 렌더 시점에 rooms와 roomId로 계산
  const getSelectedRoom = useCallback(() => {
    const target = effectiveRoomId;
    if (!target) return null;
    const rid = String(target);
    const ridNoPrefix = rid.replace(/^ROOM_/, '');
    const byExactId = rooms.find(r => String(r.id) === rid);
    if (byExactId) return byExactId;
    const byRoomId = rooms.find(r => String(r.roomId) === rid);
    if (byRoomId) return byRoomId;
    const byIdNoPrefix = rooms.find(r => String(r.id).replace(/^ROOM_/, '') === ridNoPrefix);
    if (byIdNoPrefix) return byIdNoPrefix;
    const byRoomIdNoPrefix = rooms.find(r => String(r.roomId || '').replace(/^ROOM_/, '') === ridNoPrefix);
    if (byRoomIdNoPrefix) return byRoomIdNoPrefix;
    return null;
  }, [roomId, rooms]);

  // API에서 채팅방 목록 가져오기
  useEffect(() => {
    const fetchChatRooms = async () => {
      console.log('=== API 호출 시작 ===');
      console.log('호출 URL: /api/chat/me/chatRooms');
      
      try {
        const response = await axiosInstance.get('/api/chat/me/chatRooms');  // axiosInstance 사용
        console.log('=== 채팅방 목록 API 응답 전체 ===');
        console.log('전체 응답 객체:', response);
        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);
        console.log('=== 응답 데이터 상세 분석 ===');
        console.log('응답 데이터:', response.data);
        console.log('응답 데이터 타입:', typeof response.data);
        console.log('응답 데이터 길이:', response.data?.length);
        console.log('응답 데이터 JSON 구조:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // API 응답 데이터가 있고 배열인 경우에만 사용
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('API 데이터로 업데이트:', response.data);
          // API 데이터의 id 필드 확인
          console.log('첫 번째 방의 id:', response.data[0]?.id);
          console.log('첫 번째 방의 roomId:', response.data[0]?.roomId);
          console.log('첫 번째 방의 모든 필드:', Object.keys(response.data[0] || {}));
          
          // API 데이터의 필드명을 통일 (roomId를 id로 매핑)
          const processedData = response.data.map((room, index) => {
            // 각 방의 원본 데이터 상세 로그
            console.log(`=== 방 ${index + 1} 상세 분석 ===`);
            console.log(`방 ${index + 1} 원본 데이터 전체:`, room);
            console.log(`방 ${index + 1} 원본 데이터 JSON:`, JSON.stringify(room, null, 2));
            console.log(`방 ${index + 1} 모든 키:`, Object.keys(room));
            console.log(`방 ${index + 1} 값들:`, Object.values(room));
            
            console.log(`=== 방 ${index + 1} 필드별 상세 분석 ===`);
            console.log(`방 ${index + 1} notReadMessageCount 관련 필드들:`, {
              notReadMessageCount: room.notReadMessageCount,
              unreadCount: room.unreadCount,
              not_read_message_count: room.not_read_message_count,
              unread_count: room.unread_count,
              notReadCount: room.notReadCount,
              unReadMessageCount: room.unReadMessageCount
            });
            
            console.log(`방 ${index + 1} lastMessage 관련 필드들:`, {
              lastMessage: room.lastMessage,
              lastMsg: room.lastMsg,
              recentMessage: room.recentMessage,
              last_message: room.last_message,
              recent_message: room.recent_message,
              latestMessage: room.latestMessage
            });
            
            console.log(`방 ${index + 1} title 관련 필드들:`, {
              title: room.title,
              roomName: room.roomName,
              name: room.name
            });
            
            console.log(`방 ${index + 1} id 관련 필드들:`, {
              id: room.id,
              roomId: room.roomId
            });
            
            const mappedRoom = {
            ...room,
              id: room.roomId || room.id, // roomId가 있으면 id로 사용, 없으면 기존 id 사용
              title: room.title || room.roomName || room.name || `채팅방 ${room.roomId || room.id}`, // title 필드 매핑
              lastMessage: room.lastMessage || room.lastMsg || room.recentMessage || room.last_message || room.recent_message || room.latestMessage || '메시지가 없습니다', // lastMessage 필드 매핑
              updatedAt: formatDate(room.updatedAt || room.lastMessageTime || room.modifiedAt || new Date()), // 날짜 필드 매핑
              notReadMessageCount: room.notReadMessageCount || room.unreadCount || room.not_read_message_count || room.unread_count || room.notReadCount || room.unReadMessageCount || 0 // API에서 받은 값 사용, 없으면 0
            };
            
            console.log(`=== 방 ${index + 1} 매핑 결과 ===`);
            console.log(`방 ${index + 1} 매핑 후 전체:`, mappedRoom);
            console.log(`방 ${index + 1} 매핑 후 주요 필드:`, {
              id: mappedRoom.id,
              title: mappedRoom.title,
              lastMessage: mappedRoom.lastMessage,
              updatedAt: mappedRoom.updatedAt,
              notReadMessageCount: mappedRoom.notReadMessageCount
            });
            console.log(`방 ${index + 1} 매핑 후 JSON:`, JSON.stringify(mappedRoom, null, 2));
            
            return mappedRoom;
          });
          // updatedAt 내림차순으로 정렬
          const sortedData = processedData.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB - dateA; // 내림차순 (최신순)
          });
          
          console.log('처리된 데이터:', sortedData);
          console.log('첫 번째 방 처리 결과:', {
            id: sortedData[0]?.id,
            title: sortedData[0]?.title,
            lastMessage: sortedData[0]?.lastMessage,
            updatedAt: sortedData[0]?.updatedAt,
            notReadMessageCount: sortedData[0]?.notReadMessageCount
          });
          console.log('🔍 setRooms 직전 sortedData 확인:', sortedData);
          console.log('🔍 첫 번째 방의 notReadMessageCount:', sortedData[0]?.notReadMessageCount);
          console.log('🔍 첫 번째 방의 notReadMessageCount 타입:', typeof sortedData[0]?.notReadMessageCount);
          console.log('🔍 첫 번째 방의 notReadMessageCount > 0:', sortedData[0]?.notReadMessageCount > 0);
          setRooms(sortedData);
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          // 페이지네이션 응답 구조인 경우
          console.log('페이지네이션 데이터로 업데이트:', response.data.content);
          console.log('첫 번째 방의 id:', response.data.content[0]?.id);
          console.log('첫 번째 방의 roomId:', response.data.content[0]?.roomId);
          console.log('첫 번째 방의 모든 필드:', Object.keys(response.data.content[0] || {}));
          
          // API 데이터의 필드명을 통일 (roomId를 id로 매핑)
          const processedData = response.data.content.map((room, index) => {
            // 각 방의 원본 데이터 상세 로그
            console.log(`페이지네이션 방 ${index + 1} 원본 데이터:`, room);
            console.log(`페이지네이션 방 ${index + 1} 모든 키:`, Object.keys(room));
            console.log(`페이지네이션 방 ${index + 1} notReadMessageCount 관련 필드들:`, {
              notReadMessageCount: room.notReadMessageCount,
              unreadCount: room.unreadCount,
              not_read_message_count: room.not_read_message_count,
              unread_count: room.unread_count,
              notReadCount: room.notReadCount,
              unReadMessageCount: room.unReadMessageCount
            });
            
            // lastMessage 관련 필드들 상세 로그 (페이지네이션)
            console.log(`페이지네이션 방 ${index + 1} lastMessage 관련 필드들:`, {
              lastMessage: room.lastMessage,
              lastMsg: room.lastMsg,
              recentMessage: room.recentMessage,
              last_message: room.last_message,
              recent_message: room.recent_message,
              latestMessage: room.latestMessage
            });
            
            const mappedRoom = {
            ...room,
              id: room.roomId || room.id, // roomId가 있으면 id로 사용, 없으면 기존 id 사용
              title: room.title || room.roomName || room.name || `채팅방 ${room.roomId || room.id}`, // title 필드 매핑
              lastMessage: room.lastMessage || room.lastMsg || room.recentMessage || room.last_message || room.recent_message || room.latestMessage || '메시지가 없습니다', // lastMessage 필드 매핑
              updatedAt: formatDate(room.updatedAt || room.lastMessageTime || room.modifiedAt || new Date()), // 날짜 필드 매핑
              notReadMessageCount: room.notReadMessageCount || room.unreadCount || room.not_read_message_count || room.unread_count || room.notReadCount || room.unReadMessageCount || 0 // API에서 받은 값 사용, 없으면 0
            };
            
            console.log(`페이지네이션 방 ${index + 1} 매핑 후:`, {
              id: mappedRoom.id,
              title: mappedRoom.title,
              lastMessage: mappedRoom.lastMessage,
              notReadMessageCount: mappedRoom.notReadMessageCount
            });
            
            return mappedRoom;
          });
          // updatedAt 내림차순으로 정렬
          const sortedData = processedData.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB - dateA; // 내림차순 (최신순)
          });
          
          console.log('처리된 페이지네이션 데이터:', sortedData);
          console.log('첫 번째 방 페이지네이션 처리 결과:', {
            id: sortedData[0]?.id,
            title: sortedData[0]?.title,
            lastMessage: sortedData[0]?.lastMessage,
            updatedAt: sortedData[0]?.updatedAt,
            notReadMessageCount: sortedData[0]?.notReadMessageCount
          });
          setRooms(sortedData);
        } else {
          console.log('API 응답이 배열이 아니거나 비어있어서 더미 데이터를 사용합니다.');
          console.log('API 응답 상태:', {
            hasData: !!response.data,
            isArray: Array.isArray(response.data),
            length: response.data?.length,
            data: response.data
          });
          
          // 더미 데이터 사용 (API 데이터가 없을 때)
          console.log('더미 데이터 사용 중');
          const testDummyData = dummyRooms.map((room, index) => ({
            ...room,
            lastMessage: room.lastMessage || '메시지가 없습니다',
            notReadMessageCount: room.notReadMessageCount || 0
          }));
          console.log('더미 데이터:', testDummyData);
          setRooms(testDummyData);
        }
      } catch (error) {
        console.error('채팅방 목록 가져오기 실패:', error);
        console.error('에러 상세:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        console.error('에러 URL:', error.config?.url);
        // 에러 발생 시 더미 데이터 유지
      }
    };

    fetchChatRooms();
  }, []);

  // 현재 경로에 따라 채팅방 링크 결정
  const getChatLink = (roomId) => {
    if (location.pathname.startsWith('/admin')) {
      return `/admin/chat/${roomId}`;
    } else {
      return `/chat/${roomId}`;
    }
  };

  // 읽지 않은 채팅방 개수 계산 (안전한 배열 처리)
  const unreadCount = Array.isArray(rooms) ? rooms.filter(room => room.notReadMessageCount > 0).length : 0;

  // 채팅방 클릭 시 읽음 처리
  const handleRoomClick = async (roomId) => {
    // 새로운 채팅방을 클릭했으므로 currentRoomInfo 초기화
    setCurrentRoomInfo(null);
    console.log(`🔄 채팅방 ${roomId} 클릭 - currentRoomInfo 초기화`);
    
    // 해당 채팅방 찾기
    const room = rooms.find(r => r.id === roomId);
    if (room && room.notReadMessageCount > 0) {
      // 즉시 UI 업데이트
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId ? { ...room, notReadMessageCount: 0 } : room
        )
      );
      console.log(`채팅방 ${roomId} 읽음 처리 완료`);
    }
  };

  // 방 삭제(나가기) 함수 - 백엔드 API 연동
  const handleDeleteRoom = async (id) => {
    if (!window.confirm('정말 이 채팅방을 나가시겠습니까? (삭제 처리)')) return;
    try {
      console.log('채팅방 나가기 요청 시작:', id);
      const url = `/api/chat/me/chatRooms/${id}`;
      const res = await axiosInstance.patch(url);
      console.log('채팅방 나가기 응답 상태:', res.status);
      if (res.status === 204) {
        // 목록에서 제거
        setRooms(prev => prev.filter(r => r.id !== id));
        console.log('채팅방 목록에서 제거 완료:', id);
        // 현재 보고 있던 방이면 목록으로 이동
        if (id === roomId) {
          if (location.pathname.startsWith('/admin')) {
            navigate('/admin/chat');
          } else {
            navigate('/chat');
          }
        }
      } else {
        console.warn('예상치 못한 상태 코드:', res.status);
      }
    } catch (error) {
      console.error('채팅방 나가기 요청 실패:', error);
      alert('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const isAdminChat = location.pathname.startsWith('/admin/chat');
  // 현재 선택된 방과 제목 계산
  const selectedRoom = getSelectedRoom();
  // currentRoomInfo가 있으면 우선 사용, 없으면 selectedRoom에서 가져옴
  const selectedRoomTitle = currentRoomInfo?.title || selectedRoom?.title || '';
  try {
    console.log('🧭 선택 로깅:', {
      paramRoomId: roomId,
      effectiveRoomId,
      roomsCount: rooms.length,
      roomsTitles: rooms.map(r => r.title),
      roomsIds: rooms.map(r => ({ id: r.id, roomId: r.roomId })),
      selectedExists: !!selectedRoom,
      selected: selectedRoom ? { id: selectedRoom.id, roomId: selectedRoom.roomId, title: selectedRoom.title } : null,
      currentRoomInfo: currentRoomInfo ? { id: currentRoomInfo.id, title: currentRoomInfo.title } : null,
      selectedRoomTitle,
    });
  } catch (_) {}
  return (
    <div className={`flex h-screen ${isAdminChat ? 'theme-purple' : 'theme-blue'}`}>
      {/* 사이드바 - 스크롤 가능하도록 수정 */}
      <aside className="w-64 md:w-72 lg:w-80 xl:w-96 border-r bg-white flex flex-col">
        <div className="px-4 py-1 font-bold border-t border-b bg-gray-50 text-gray-900">
          채팅 목록 ({rooms.length})
          {console.log('🚨 현재 rooms 상태:', rooms)}
          {console.log('🚨 현재 rooms title:', rooms.map(r => r.title))}
          {console.log('🚨 unreadCount:', unreadCount)}
          {rooms.map((r, i) => console.log(`🚨 방 ${i+1} notReadMessageCount:`, r.notReadMessageCount))}
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-red-600 font-normal">
              (읽지 않음: {unreadCount})
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul>
            {rooms.map((room, index) => {
              console.log(`🔍 렌더링 중인 방 ${index + 1}:`, {
                id: room.id,
                title: room.title,
                notReadMessageCount: room.notReadMessageCount,
                notReadMessageCountType: typeof room.notReadMessageCount,
                condition: room.notReadMessageCount > 0
              });
              return (
              <li
                key={room.id || `room-${index}`}
                className={`flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                  ${room.id === roomId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  ${Number(room.notReadMessageCount) > 0 ? 'bg-yellow-50 border-l-2 border-l-yellow-400' : ''}
                  ${room.roomType === 'GROUP' ? 'border-l-2 border-l-green-300' : ''}`}
              >
                <Link to={getChatLink(room.id)} className="flex-1 min-w-0" onClick={() => handleRoomClick(room.id)}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center min-w-0 flex-1">
                      {/* 채팅방 타입 아이콘 */}
                      <div className="flex-shrink-0 mr-2">
                        {room.roomType === 'GROUP' ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium truncate text-gray-900 font-semibold">{room.title}</span>
                          {room.roomType === 'GROUP' && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex-shrink-0">
                              그룹
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {Number(room.notReadMessageCount) > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <div className={`text-xs truncate mt-1 ml-8 ${Number(room.notReadMessageCount) > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{room.lastMessage}</div>
                  <div className="text-xs text-gray-400 mt-1 ml-8">{formatDate(room.updatedAt)}</div>
                </Link>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="text-blue-400 hover:text-blue-600 px-2 ml-2 flex-shrink-0 transition-colors duration-200"
                  title="채팅방 삭제"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* 채팅방 선택 전 / 후 Outlet */}
      <main className="flex-1 p-4 bg-gray-50">
        <Routes>
          {/* 아무 방도 선택 안됐을 때 */}
          <Route
            index
            element={
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-2xl mb-2">💬</div>
                  <div>채팅방을 선택하세요.</div>
                  <div className="text-sm mt-1">총 {rooms.length}개의 채팅방이 있습니다.</div>
                </div>
              </div>
            }
          />
          {/* 채팅방이 선택됐을 때 */}
          <Route 
            path=":roomId" 
            element={
              <ChatRoom 
                roomId={String(effectiveRoomId || '')}
                isWebSocketConnected={isWebSocketConnected}
                onSendMessage={handleSendMessage}
                onMessageUpdate={(callback) => {
                  chatRoomUpdateCallbackRef.current = callback;
                }}
                roomTitle={selectedRoomTitle}
                failedMessages={failedMessages}
                onRetryMessage={handleRetryMessage}
                onAbandonMessage={handleAbandonMessage}
                onRoomInfoUpdate={handleRoomInfoUpdate}
              />
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

export default ChatPage; 