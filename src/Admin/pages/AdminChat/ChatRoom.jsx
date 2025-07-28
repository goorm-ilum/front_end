// src/pages/admin/chats/ChatRoom.jsx
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
};

const ChatRoom = () => {
  const { roomId } = useParams();
  const scrollRef = useRef();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 실제 API 호출 → 해당 방 메시지 불러오기
    setMessages(dummyMessages[roomId] || []);
  }, [roomId]);

  useEffect(() => {
    // 새 메시지 생기면 스크롤 최하단으로
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { from: 'admin', text: input, at: new Date().toLocaleTimeString() };
    // 실제 API 호출 → 서버에 전송
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                m.from === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <p className="text-sm">{m.text}</p>
              <p className="text-xs text-right mt-1">{m.at}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t p-2 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="메시지를 입력하세요..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;