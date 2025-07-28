import { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: '안녕하세요! 여행 상담을 받고 싶어요.',
      timestamp: '10:30'
    },
    {
      id: 2,
      sender: 'agent',
      text: '안녕하세요! TalkTrip 상담사입니다. 어떤 여행을 계획하고 계신가요?',
      timestamp: '10:31'
    },
    {
      id: 3,
      sender: 'user',
      text: '제주도 여행을 계획하고 있는데 추천해주실 수 있나요?',
      timestamp: '10:32'
    },
    {
      id: 4,
      sender: 'agent',
      text: '제주도 여행 추천해드릴게요! 렌터카 이용하시면 편리하고, 성산일출봉, 만장굴, 한라산 등이 인기 있어요. 언제 가실 예정인가요?',
      timestamp: '10:33'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // 상담사 응답 시뮬레이션
      setTimeout(() => {
        const agentResponse = {
          id: messages.length + 2,
          sender: 'agent',
          text: '네, 말씀해주세요! 더 자세한 상담을 도와드리겠습니다.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-lg shadow-lg">
      {/* 채팅 헤더 */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">TalkTrip 상담</h2>
        <p className="text-sm opacity-90">실시간 여행 상담 서비스</p>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
