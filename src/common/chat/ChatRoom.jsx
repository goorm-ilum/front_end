// src/common/chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/mainApi';  // mainApi의 axiosInstance 사용
import { getCookie } from '../util/cookieUtil';  // 쿠키 유틸 추가
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const dummyMessages = {
  'ROOM001': [
    { messageId: 'msg001', memberId: 'user1', message: '안녕하세요.', createdAt: '2025-01-15 10:00:00' },
    { messageId: 'msg002', memberId: 'admin', message: '무엇이 궁금하신가요?', createdAt: '2025-01-15 10:01:00' },
  ],
  'ROOM002': [
    { messageId: 'msg003', memberId: 'user2', message: '결제가 안됩니다.', createdAt: '2025-01-15 11:10:00' },
    { messageId: 'msg004', memberId: 'admin', message: '결제 수단을 알려주세요.', createdAt: '2025-01-15 11:12:00' },
  ],
  'ROOM003': [
    { messageId: 'msg005', memberId: 'user3', message: '취소가 되나요?', createdAt: '2025-01-15 09:30:00' },
    { messageId: 'msg006', memberId: 'admin', message: '네, 취소 가능합니다. 언제 이용하실 예정이었나요?', createdAt: '2025-01-15 09:32:00' },
  ],
  'ROOM004': [
    { messageId: 'msg007', memberId: 'user4', message: '서울 투어 상품에 대해 문의드립니다.', createdAt: '2025-01-15 14:15:00' },
    { messageId: 'msg008', memberId: 'admin', message: '어떤 부분이 궁금하신가요?', createdAt: '2025-01-15 14:17:00' },
  ],
  'ROOM005': [
    { messageId: 'msg009', memberId: 'user5', message: '날짜를 변경하고 싶습니다.', createdAt: '2025-01-15 16:20:00' },
    { messageId: 'msg010', memberId: 'admin', message: '변경하고 싶은 날짜를 알려주세요.', createdAt: '2025-01-15 16:22:00' },
  ],
  'ROOM006': [
    { messageId: 'msg011', memberId: 'user6', message: '리뷰를 어떻게 작성하나요?', createdAt: '2025-01-15 13:45:00' },
    { messageId: 'msg012', memberId: 'admin', message: '마이페이지에서 작성 가능합니다.', createdAt: '2025-01-15 13:47:00' },
  ],
  'ROOM007': [
    { messageId: 'msg013', memberId: 'user7', message: '환불 처리가 안되고 있습니다.', createdAt: '2025-01-15 12:30:00' },
    { messageId: 'msg014', memberId: 'admin', message: '환불 신청 내역을 확인해드리겠습니다.', createdAt: '2025-01-15 12:32:00' },
  ],
  'ROOM008': [
    { messageId: 'msg015', memberId: 'user8', message: '가이드 언어는 어떤 것이 있나요?', createdAt: '2025-01-15 15:10:00' },
    { messageId: 'msg016', memberId: 'admin', message: '한국어, 영어, 일본어, 중국어 가이드가 있습니다.', createdAt: '2025-01-15 15:12:00' },
  ],
  'ROOM009': [
    { messageId: 'msg017', memberId: 'user9', message: '집합 장소까지 어떻게 가나요?', createdAt: '2025-01-15 11:25:00' },
    { messageId: 'msg018', memberId: 'admin', message: '지하철 2호선 홍대입구역 3번 출구에서 도보 5분입니다.', createdAt: '2025-01-15 11:27:00' },
  ],
  'ROOM010': [
    { messageId: 'msg019', memberId: 'user10', message: '점심 식사가 포함되나요?', createdAt: '2025-01-15 10:40:00' },
    { messageId: 'msg020', memberId: 'admin', message: '네, 점심 식사가 포함되어 있습니다.', createdAt: '2025-01-15 10:42:00' },
  ],
  'ROOM011': [
    { messageId: 'msg021', memberId: 'user11', message: '비가 오면 어떻게 되나요?', createdAt: '2025-01-15 08:15:00' },
    { messageId: 'msg022', memberId: 'admin', message: '우천 시 실내 프로그램으로 대체됩니다.', createdAt: '2025-01-15 08:17:00' },
  ],
  'ROOM012': [
    { messageId: 'msg023', memberId: 'user12', message: '인원을 추가하고 싶습니다.', createdAt: '2025-01-15 17:30:00' },
    { messageId: 'msg024', memberId: 'admin', message: '몇 명 추가하시겠습니까?', createdAt: '2025-01-15 17:32:00' },
  ],
  'ROOM013': [
    { messageId: 'msg025', memberId: 'user13', message: '단체 할인이 있나요?', createdAt: '2025-01-15 14:50:00' },
    { messageId: 'msg026', memberId: 'admin', message: '10명 이상 단체 시 10% 할인됩니다.', createdAt: '2025-01-15 14:52:00' },
  ],
  'ROOM014': [
    { messageId: 'msg027', memberId: 'user14', message: '사진 촬영이 가능한가요?', createdAt: '2025-01-15 16:05:00' },
    { messageId: 'msg028', memberId: 'admin', message: '네, 자유롭게 촬영 가능합니다.', createdAt: '2025-01-15 16:07:00' },
  ],
  'ROOM015': [
    { messageId: 'msg029', memberId: 'user15', message: '출발 시간을 변경하고 싶습니다.', createdAt: '2025-01-15 13:20:00' },
    { messageId: 'msg030', memberId: 'admin', message: '변경하고 싶은 시간을 알려주세요.', createdAt: '2025-01-15 13:22:00' },
  ],
  // 기존 room1, room2 형식도 유지 (더미 데이터와의 호환성)
  room1: [
    { messageId: 'msg001', memberId: 'user1', message: '안녕하세요.', createdAt: '2025-01-15 10:00:00' },
    { messageId: 'msg002', memberId: 'admin', message: '무엇이 궁금하신가요?', createdAt: '2025-01-15 10:01:00' },
  ],
  room2: [
    { messageId: 'msg003', memberId: 'user2', message: '결제가 안됩니다.', createdAt: '2025-01-15 11:10:00' },
    { messageId: 'msg004', memberId: 'admin', message: '결제 수단을 알려주세요.', createdAt: '2025-01-15 11:12:00' },
  ],
  room3: [
    { messageId: 'msg005', memberId: 'user3', message: '취소가 되나요?', createdAt: '2025-01-15 09:30:00' },
    { messageId: 'msg006', memberId: 'admin', message: '네, 취소 가능합니다. 언제 이용하실 예정이었나요?', createdAt: '2025-01-15 09:32:00' },
  ],
  room4: [
    { messageId: 'msg007', memberId: 'user4', message: '서울 투어 상품에 대해 문의드립니다.', createdAt: '2025-01-15 14:15:00' },
    { messageId: 'msg008', memberId: 'admin', message: '어떤 부분이 궁금하신가요?', createdAt: '2025-01-15 14:17:00' },
  ],
  room5: [
    { messageId: 'msg009', memberId: 'user5', message: '날짜를 변경하고 싶습니다.', createdAt: '2025-01-15 16:20:00' },
    { messageId: 'msg010', memberId: 'admin', message: '변경하고 싶은 날짜를 알려주세요.', createdAt: '2025-01-15 16:22:00' },
  ],
  room6: [
    { messageId: 'msg011', memberId: 'user6', message: '리뷰를 어떻게 작성하나요?', createdAt: '2025-01-15 13:45:00' },
    { messageId: 'msg012', memberId: 'admin', message: '마이페이지에서 작성 가능합니다.', createdAt: '2025-01-15 13:47:00' },
  ],
  room7: [
    { messageId: 'msg013', memberId: 'user7', message: '환불 처리가 안되고 있습니다.', createdAt: '2025-01-15 12:30:00' },
    { messageId: 'msg014', memberId: 'admin', message: '환불 신청 내역을 확인해드리겠습니다.', createdAt: '2025-01-15 12:32:00' },
  ],
  room8: [
    { messageId: 'msg015', memberId: 'user8', message: '가이드 언어는 어떤 것이 있나요?', createdAt: '2025-01-15 15:10:00' },
    { messageId: 'msg016', memberId: 'admin', message: '한국어, 영어, 일본어, 중국어 가이드가 있습니다.', createdAt: '2025-01-15 15:12:00' },
  ],
  room9: [
    { messageId: 'msg017', memberId: 'user9', message: '집합 장소까지 어떻게 가나요?', createdAt: '2025-01-15 11:25:00' },
    { messageId: 'msg018', memberId: 'admin', message: '지하철 2호선 홍대입구역 3번 출구에서 도보 5분입니다.', createdAt: '2025-01-15 11:27:00' },
  ],
  room10: [
    { messageId: 'msg019', memberId: 'user10', message: '점심 식사가 포함되나요?', createdAt: '2025-01-15 10:40:00' },
    { messageId: 'msg020', memberId: 'admin', message: '네, 점심 식사가 포함되어 있습니다.', createdAt: '2025-01-15 10:42:00' },
  ],
  room11: [
    { messageId: 'msg021', memberId: 'user11', message: '비가 오면 어떻게 되나요?', createdAt: '2025-01-15 08:15:00' },
    { messageId: 'msg022', memberId: 'admin', message: '우천 시 실내 프로그램으로 대체됩니다.', createdAt: '2025-01-15 08:17:00' },
  ],
  room12: [
    { messageId: 'msg023', memberId: 'user12', message: '인원을 추가하고 싶습니다.', createdAt: '2025-01-15 17:30:00' },
    { messageId: 'msg024', memberId: 'admin', message: '몇 명 추가하시겠습니까?', createdAt: '2025-01-15 17:32:00' },
  ],
  room13: [
    { messageId: 'msg025', memberId: 'user13', message: '단체 할인이 있나요?', createdAt: '2025-01-15 14:50:00' },
    { messageId: 'msg026', memberId: 'admin', message: '10명 이상 단체 시 10% 할인됩니다.', createdAt: '2025-01-15 14:52:00' },
  ],
  room14: [
    { messageId: 'msg027', memberId: 'user14', message: '사진 촬영이 가능한가요?', createdAt: '2025-01-15 16:05:00' },
    { messageId: 'msg028', memberId: 'admin', message: '네, 자유롭게 촬영 가능합니다.', createdAt: '2025-01-15 16:07:00' },
  ],
  room15: [
    { messageId: 'msg029', memberId: 'user15', message: '출발 시간을 변경하고 싶습니다.', createdAt: '2025-01-15 13:20:00' },
    { messageId: 'msg030', memberId: 'admin', message: '변경하고 싶은 시간을 알려주세요.', createdAt: '2025-01-15 13:22:00' },
  ],
};

const ChatRoom = () => {
  const { roomId } = useParams();
  // 하드코딩으로 ROOM001 사용
  const actualRoomId = 'ROOM001';
  const scrollRef = useRef();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 사용자 ID (실제로는 로그인한 사용자 ID를 가져와야 함)
  const currentUserId = 'dhrdbs';

  console.log('=== ChatRoom 컴포넌트 렌더링 ===');


  // 로그인 상태 확인
  const checkAuthStatus = () => {
    const member = getCookie("member");
    console.log('=== 인증 상태 확인 ===');
    console.log('member 쿠키:', member);
    
    if (member) {
      console.log('accessToken 존재:', !!member.accessToken);
      console.log('refreshToken 존재:', !!member.refreshToken);
      return true;
    } else {
      console.log('로그인이 필요합니다.');
      return false;
    }
  };

  const stompClientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log('STOMP DEBUG:', msg),
    });

    client.onConnect = () => {
      console.log('✅ WebSocket 연결 성공');
      client.subscribe(`/topic/chat/${actualRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        // createdAt 필드가 없으면 현재 시간 추가
        if (!newMessage.createdAt) {
          const now = new Date();
          newMessage.createdAt = now.toISOString().slice(0, 19).replace('T', ' ');
        }
        setMessages((prev) => [...prev, newMessage]);
      });
      stompClientRef.current = client;
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP 에러:', frame);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [actualRoomId]);
  


  useEffect(() => {
    console.log('=== ChatRoom useEffect 실행 ===');
    console.log('useEffect - actualRoomId:', actualRoomId);
    console.log('useEffect - actualRoomId 타입:', typeof actualRoomId);
    
    const fetchChatMessages = async () => {
      console.log('=== fetchChatMessages 함수 시작 ===');
      console.log('actualRoomId 값:', actualRoomId);
      console.log('actualRoomId 타입:', typeof actualRoomId);
      
      if (!actualRoomId) {
        console.log('actualRoomId가 없어서 더미 데이터를 사용합니다.');
        const roomMessages = dummyMessages[actualRoomId] || [];
        setMessages(roomMessages);
        setLoading(false);
        return;
      }

      // 개발 단계에서는 인증 체크를 건너뛰고 API 호출
      console.log('개발 단계: 인증 체크를 건너뛰고 API 호출을 진행합니다.');

      try {
        setLoading(true);
        setError(null);
        
        console.log('=== 채팅방 메시지 API 호출 시작 ===');
        const apiUrl = `/api/chat/me/chatRooms/${roomId}`;
        console.log('호출 URL:', apiUrl);
        console.log('axiosInstance 설정:', axiosInstance.defaults);
        console.log('baseURL:', axiosInstance.defaults.baseURL);
        console.log('전체 URL:', `${axiosInstance.defaults.baseURL}${apiUrl}`);
        
        // API 호출 전 로그
        console.log('API 호출 직전...');
        const response = await axiosInstance.get(apiUrl);
        console.log('API 호출 완료!');
        console.log('채팅방 메시지 API 응답:', response);
        console.log('응답 데이터:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('API에서 메시지 데이터를 받았습니다:', response.data);
          setMessages(response.data);
        } else {
          console.log('API 응답이 배열이 아니거나 비어있어서 더미 데이터를 사용합니다.');
          const roomMessages = dummyMessages[roomId] || [];
          setMessages(roomMessages);
        }
      } catch (error) {
        console.error('채팅방 메시지 가져오기 실패:', error);
        
        setError('메시지를 불러오는데 실패했습니다.');
        
        // 에러 발생 시 더미 데이터 사용
        const roomMessages = dummyMessages[roomId] || [];
        setMessages(roomMessages);
      } finally {
        setLoading(false);
        console.log('=== fetchChatMessages 함수 종료 ===');
      }
    };

    console.log('fetchChatMessages 함수 호출...');
    fetchChatMessages();
  }, [roomId]);

  useEffect(() => {
    // 새 메시지 생기면 스크롤 최하단으로
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const messageDto = {
      roomId: actualRoomId,
      memberId: 'dhrdbs',
      message: input,
    };

    if (stompClientRef.current) {
      try {
        console.log('📨 WebSocket 전송 시도:', messageDto);
        console.log('🔍 stompClientRef.current:', stompClientRef.current);
        console.log('🔍 사용 가능한 메서드:', Object.getOwnPropertyNames(stompClientRef.current));
        
        // publish 메서드 사용
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(messageDto),
        });
        
        setInput('');
      } catch (error) {
        console.error('❌ WebSocket 전송 실패:', error);
        // 전송 실패 시 로컬에 추가
        const now = new Date();
        const createdAt = now.toISOString().slice(0, 19).replace('T', ' ');
        const fallbackMsg = {
          messageId: `msg${Date.now()}`,
          memberId: 'dhrdbs',
          message: input,
          createdAt,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        setInput('');
      }
    } else {
      console.warn('⚠️ WebSocket 연결 안됨 - 로컬 메시지만 추가');
      const now = new Date();
      const createdAt = now.toISOString().slice(0, 19).replace('T', ' ');
      const fallbackMsg = {
        messageId: `msg${Date.now()}`,
        memberId: 'dhrdbs',
        message: input,
        createdAt,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setInput('');
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
        <h3 className="font-semibold text-gray-900">채팅방 {roomId}</h3>
        <p className="text-sm text-gray-500">총 {messages.length}개의 메시지</p>
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
              className={`flex ${m.memberId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                  m.memberId === currentUserId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{m.message}</p>
                <p className={`text-xs mt-1 ${
                  m.memberId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {m.createdAt}
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
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="메시지를 입력하세요..."
          />
          <div className={`transition-all duration-500 ease-in-out ${input.trim() ? 'opacity-100 scale-100 w-auto' : 'opacity-0 scale-95 w-0 overflow-hidden'}`}>
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
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