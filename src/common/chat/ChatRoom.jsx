// src/common/chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const dummyMessages = {
  room1: [
    { from: 'user', text: '안녕하세요.', at: '10:00' },
    { from: 'admin', text: '무엇이 궁금하신가요?', at: '10:01' },
  ],
  room2: [
    { from: 'user', text: '결제가 안됩니다.', at: '11:10' },
    { from: 'admin', text: '결제 수단을 알려주세요.', at: '11:12' },
  ],
  room3: [
    { from: 'user', text: '취소가 되나요?', at: '09:30' },
    { from: 'admin', text: '네, 취소 가능합니다. 언제 이용하실 예정이었나요?', at: '09:32' },
  ],
  room4: [
    { from: 'user', text: '서울 투어 상품에 대해 문의드립니다.', at: '14:15' },
    { from: 'admin', text: '어떤 부분이 궁금하신가요?', at: '14:17' },
  ],
  room5: [
    { from: 'user', text: '날짜를 변경하고 싶습니다.', at: '16:20' },
    { from: 'admin', text: '변경하고 싶은 날짜를 알려주세요.', at: '16:22' },
  ],
  room6: [
    { from: 'user', text: '리뷰를 어떻게 작성하나요?', at: '13:45' },
    { from: 'admin', text: '마이페이지에서 작성 가능합니다.', at: '13:47' },
  ],
  room7: [
    { from: 'user', text: '환불 처리가 안되고 있습니다.', at: '12:30' },
    { from: 'admin', text: '환불 신청 내역을 확인해드리겠습니다.', at: '12:32' },
  ],
  room8: [
    { from: 'user', text: '가이드 언어는 어떤 것이 있나요?', at: '15:10' },
    { from: 'admin', text: '한국어, 영어, 일본어, 중국어 가이드가 있습니다.', at: '15:12' },
  ],
  room9: [
    { from: 'user', text: '집합 장소까지 어떻게 가나요?', at: '11:25' },
    { from: 'admin', text: '지하철 2호선 홍대입구역 3번 출구에서 도보 5분입니다.', at: '11:27' },
  ],
  room10: [
    { from: 'user', text: '점심 식사가 포함되나요?', at: '10:40' },
    { from: 'admin', text: '네, 점심 식사가 포함되어 있습니다.', at: '10:42' },
  ],
  room11: [
    { from: 'user', text: '비가 오면 어떻게 되나요?', at: '08:15' },
    { from: 'admin', text: '우천 시 실내 프로그램으로 대체됩니다.', at: '08:17' },
  ],
  room12: [
    { from: 'user', text: '인원을 추가하고 싶습니다.', at: '17:30' },
    { from: 'admin', text: '몇 명 추가하시겠습니까?', at: '17:32' },
  ],
  room13: [
    { from: 'user', text: '단체 할인이 있나요?', at: '14:50' },
    { from: 'admin', text: '10명 이상 단체 시 10% 할인됩니다.', at: '14:52' },
  ],
  room14: [
    { from: 'user', text: '사진 촬영이 가능한가요?', at: '16:05' },
    { from: 'admin', text: '네, 자유롭게 촬영 가능합니다.', at: '16:07' },
  ],
  room15: [
    { from: 'user', text: '출발 시간을 변경하고 싶습니다.', at: '13:20' },
    { from: 'admin', text: '변경하고 싶은 시간을 알려주세요.', at: '13:22' },
  ],
};

const ChatRoom = () => {
  const { roomId } = useParams();
  const scrollRef = useRef();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 해당 방 메시지 불러오기
    const roomMessages = dummyMessages[roomId] || [];
    setMessages(roomMessages);
    console.log('ChatRoom loaded - roomId:', roomId, 'messages:', roomMessages);
  }, [roomId]);

  useEffect(() => {
    // 새 메시지 생기면 스크롤 최하단으로
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { 
      from: 'admin', 
      text: input, 
      at: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
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
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">💬</div>
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                  m.from === 'admin' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{m.text}</p>
                <p className={`text-xs mt-1 ${
                  m.from === 'admin' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {m.at}
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
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom; 