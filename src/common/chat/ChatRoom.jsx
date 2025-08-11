// src/common/chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axiosInstance, { API_SERVER_HOST } from '../api/mainApi';  // mainApi의 axiosInstance 사용
import { getCookie } from '../util/cookieUtil';  // 쿠키 유틸 추가
// import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';
// import { Client } from '@stomp/stompjs';

const dummyMessages = {
  'ROOM001': [
    { messageId: 'msg001', accountEmail: 'user1', message: '안녕하세요.', createdAt: '2025-01-15 10:00:00' },
    { messageId: 'msg002', accountEmail: 'admin', message: '무엇이 궁금하신가요?', createdAt: '2025-01-15 10:01:00' },
  ]
};

const ChatRoom = ({ isWebSocketConnected, onSendMessage, onMessageUpdate }) => {
  const { roomId } = useParams();
  // URL에서 가져온 roomId 사용
  const actualRoomId = roomId || 'ROOM001';
  const scrollRef = useRef();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 로그인한 사용자 이메일
  const loginState = useSelector((state) => state.loginSlice);
  const currentUserEmail = loginState?.email || getCookie('member')?.email || '';

  const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
  const emailsEqual = (a, b) => normalizeEmail(a) === normalizeEmail(b);

  // 날짜를 yyyy-mm-dd hh:mm:ss 형식으로 변환하는 함수
  const formatDateTime = (dateInput) => {
    if (!dateInput) return '';
    

    
    try {
      let date;
      
      // Date 객체인 경우
      if (dateInput instanceof Date) {

        date = dateInput;
      }
      // 배열 형태인 경우 (예: [2025, 7, 7, 16, 59, 9] - 월은 0부터 시작)
      else if (Array.isArray(dateInput)) {

        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds); // 반드시 month - 1
      }
      // 콤마로 구분된 문자열인 경우 (예: "2025,8,7,16,59,9")
      else if (typeof dateInput === 'string' && dateInput.includes(',')) {

        const parts = dateInput.split(',').map(part => parseInt(part.trim()));
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = parts;
        // 월은 0부터 시작하므로 1을 빼줌
        date = new Date(year, month - 1, day, hours, minutes, seconds);
      }
      // 타임스탬프 숫자인 경우 (13자리 밀리초 또는 10자리 초)
      else if (typeof dateInput === 'number') {

        // 10자리면 초 단위이므로 1000을 곱해서 밀리초로 변환
        const timestamp = dateInput.toString().length === 10 ? dateInput * 1000 : dateInput;
        date = new Date(timestamp);
      }
      // 문자열 숫자인 경우 (예: "1736939200000")
      else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {

        const timestamp = parseInt(dateInput);
        // 10자리면 초 단위이므로 1000을 곱해서 밀리초로 변환
        const finalTimestamp = dateInput.length === 10 ? timestamp * 1000 : timestamp;
        date = new Date(finalTimestamp);
      }
      // 일반 문자열 날짜인 경우
      else {

        date = new Date(dateInput);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {

        return String(dateInput); // 파싱 실패 시 문자열로 반환
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      return formatted;
    } catch (error) {

      return String(dateInput); // 에러 시 문자열로 반환
    }
  };




  // 로그인 상태 확인
  const checkAuthStatus = () => {
    const member = getCookie("member");


    
    if (member) {


      return true;
    } else {

      return false;
    }
  };

  // ChatPage.jsx에서 WebSocket 메시지를 받아 처리하는 콜백 등록
  useEffect(() => {
    if (onMessageUpdate) {
      const handleNewMessage = (chatMessage) => {

        
        // createdAt 필드가 없으면 현재 시간 추가
        if (!chatMessage.createdAt) {
          const now = new Date();
          chatMessage.createdAt = formatDateTime(now); // formatDateTime 함수 사용

        }
        
        // 중복 메시지 방지
        setMessages((prev) => {
          let isDuplicate = false;
          
          if (chatMessage.messageId) {
            // messageId가 있는 경우
            isDuplicate = prev.some(msg => msg.messageId === chatMessage.messageId);
            if (isDuplicate) {
  
              return prev;
            }
          } else {
            // messageId가 없는 경우 - 메시지 내용, 발신자로 중복 체크 (시간은 5초 이내면 같은 메시지로 인식)
            const currentTime = new Date(chatMessage.createdAt).getTime();
            isDuplicate = prev.some(msg => {
              if (msg.message === chatMessage.message && msg.accountEmail === chatMessage.accountEmail) {
                // 시간이 5초 이내인지 확인
                if (msg.createdAt) {
                  const msgTime = new Date(msg.createdAt).getTime();
                  const timeDiff = Math.abs(currentTime - msgTime);
                  if (timeDiff < 5000) { // 5초 이내
                    return true;
                  }
                }
              }
              return false;
            });
            
            if (isDuplicate) {

              return prev;
            }
          }
          


          return [...prev, chatMessage];
        });
      };
      
      // 콜백 등록
      onMessageUpdate(handleNewMessage);
    }
  }, [onMessageUpdate]);
  


  // /topic/chat/room/{roomId}/update 구독 (실시간 업데이트 수신)
  useEffect(() => {
    let isMounted = true;
    const stompRef = { current: null };
    const subscriptionRef = { current: null };

    const connectAndSubscribe = async () => {
      try {
        const wsBase = API_SERVER_HOST.replace(/\/$/, '').replace(/^http/, 'ws');
        const brokerWsUrl = `${wsBase}/ws/websocket`;

        const getAccessToken = () => {
          try {
            const localToken = window.localStorage?.getItem('accessToken');
            if (localToken) return localToken;
          } catch (_) {}
          if (loginState?.accessToken) return loginState.accessToken;
          const member = getCookie('member');
          if (member && member.accessToken) return member.accessToken;
          return null;
        };

        const makeConnectHeaders = () => {
          const token = getAccessToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        };

        const client = new Client({
          webSocketFactory: () => new WebSocket(brokerWsUrl),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: makeConnectHeaders(),
          beforeConnect: () => {
            client.connectHeaders = makeConnectHeaders();
          },
          debug: (msg) => console.log('STOMP ROOM DEBUG:', msg),
        });

        client.onConnect = () => {
          if (!isMounted) return;
          // 방 업데이트 토픽 구독
          const dest = `/topic/chat/room/${actualRoomId}/update`;
          const sub = client.subscribe(dest, (message) => {
            try {
              console.log('📨 ROOM UPDATE RAW:', message);
              console.log('📨 ROOM UPDATE BODY:', message.body);
              const payload = JSON.parse(message.body || '{}');
              console.log('📨 ROOM UPDATE PARSED:', payload);
              // payload 구조: roomId, memberId/accountEmail, message(또는 content/msg/lastMessage), updatedAt 등
              const createdAt = payload.createdAt || payload.updatedAt || Date.now();
              const text = payload.message ?? payload.content ?? payload.lastMessage ?? payload.msg ?? payload.text ?? '';
              const incoming = {
                messageId: payload.messageId || `msg_${Date.now()}`,
                accountEmail: payload.accountEmail || payload.memberId || payload.senderAccountEmail || payload.sender || payload.email || payload.emailAccount || '',
                message: String(text),
                createdAt,
              };

              // 현재 방 체크는 토픽 자체가 방별이라 완화하되, 혹시 몰라 접두사 제거 비교 추가
              const payloadRoomId = String(payload.roomId || '');
              const currentRoomId = String(actualRoomId || '');
              const sameRoom = (
                payloadRoomId === currentRoomId ||
                payloadRoomId.replace(/^ROOM_/, '') === currentRoomId.replace(/^ROOM_/, '')
              );
              if (!sameRoom) return;

              // 화면에 추가 (중복 필터 강화: 내용/보낸사람/시간 3중 체크)
              setMessages((prev) => {
                if (!incoming.message || incoming.message.trim().length === 0) {
                  // 내용이 비어있으면 표시하지 않음
                  return prev;
                }
                const isDup = prev.some(m =>
                  (incoming.messageId && m.messageId === incoming.messageId) ||
                  (
                    m.message === incoming.message &&
                    emailsEqual(m.accountEmail, incoming.accountEmail) &&
                    Math.abs(new Date(m.createdAt).getTime() - new Date(incoming.createdAt).getTime()) < 3000
                  )
                );
                if (isDup) return prev;
                return [...prev, incoming];
              });
            } catch (e) {
              console.error('룸 업데이트 파싱 실패:', e);
            }
          });
          subscriptionRef.current = sub;
        };

        client.onStompError = (frame) => {
          console.error('ChatRoom STOMP 에러:', frame?.body || frame);
        };

        client.activate();
        stompRef.current = client;
      } catch (e) {
        console.error('ChatRoom 업데이트 구독 초기화 실패:', e);
      }
    };

    connectAndSubscribe();

    return () => {
      isMounted = false;
      try { subscriptionRef.current?.unsubscribe(); } catch (_) {}
      try { stompRef.current?.deactivate(); } catch (_) {}
    };
  }, [actualRoomId, loginState?.accessToken]);

  useEffect(() => {



    
    const fetchChatMessages = async () => {



      
      if (!actualRoomId) {

        const roomMessages = dummyMessages[actualRoomId] || [];
        setMessages(roomMessages);
        setLoading(false);
        return;
      }

      // 개발 단계에서는 인증 체크를 건너뛰고 API 호출


      try {
        setLoading(true);
        setError(null);
        

        const apiUrl = `/api/chat/me/chatRooms/${roomId}`;




        
        // API 호출 전 로그

        const response = await axiosInstance.get(apiUrl);



        
        if (response.data && Array.isArray(response.data)) {

          setMessages(response.data);
        } else {

          const roomMessages = dummyMessages[roomId] || [];
          setMessages(roomMessages);
        }
      } catch (error) {

        
        setError('메시지를 불러오는데 실패했습니다.');
        
        // 에러 발생 시 더미 데이터 사용
        const roomMessages = dummyMessages[roomId] || [];
        setMessages(roomMessages);
      } finally {
        setLoading(false);

      }
    };


    fetchChatMessages();
  }, [roomId]);

  useEffect(() => {
    // 새 메시지 생기면 스크롤 최하단으로
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageDto = {
      roomId: actualRoomId,
      accountEmail: currentUserEmail,
      receiverAccountEmail: 'JTRweb',
      message: input
    };

    // 즉시 로컬 상태에 메시지 추가 (즉시 화면에 표시)
    const now = new Date();
    const createdAt = formatDateTime(now); // formatDateTime 함수 사용
    const newMessage = {
      messageId: `msg${Date.now()}`,
      accountEmail: currentUserEmail,
      message: input,
      createdAt,
    };
    
    setInput('');

    // ChatPage.jsx의 WebSocket을 통한 메시지 전송


    
    if (onSendMessage) {
      try {
        const result = onSendMessage(messageDto);
        
        if (result.success) {

        } else {

          console.warn('메시지는 화면에 추가되었지만 서버 전송에 실패했습니다.');
        }
        
      } catch (error) {
        console.error('❌ 메시지 전송 콜백 실행 실패:', error);
        console.warn('메시지는 화면에 추가되었지만 서버 전송에 실패했습니다.');
      }
    } else {
      console.warn('⚠️ onSendMessage 콜백이 없어서 서버 전송을 건너뜀');
      console.warn('⚠️ 로컬 메시지만 추가됨');
    }
  };
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* 채팅방 헤더 */}
      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">채팅방 {roomId}</h3>
            <p className="text-sm text-gray-500">총 {messages.length}개의 메시지</p>
          </div>

        </div>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <div className="text-center text-gray-500 py-8">메시지를 불러오는 중입니다...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {messages.length === 0 && !loading && !error ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">💬</div>
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${emailsEqual(m.accountEmail, currentUserEmail) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                  emailsEqual(m.accountEmail, currentUserEmail) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{m.message}</p>
                <p className={`text-xs mt-1 ${
                  emailsEqual(m.accountEmail, currentUserEmail) ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatDateTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            placeholder="메시지를 입력하세요..."
          />
          <div className={`transition-all duration-500 ease-in-out ${input.trim() ? 'opacity-100 scale-100 w-auto' : 'opacity-0 scale-95 w-0 overflow-hidden'}`}>
            <button
              onClick={handleSend}
              className="btn-main px-4 py-2 rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom; 