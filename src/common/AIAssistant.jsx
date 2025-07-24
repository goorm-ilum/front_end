import { useState } from 'react';

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
    // 실제 검색/응답 로직은 추후 구현
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {open ? (
        <div className="w-80 bg-white rounded-xl shadow-2xl p-4 mb-2 flex flex-col max-h-[400px]">
          <div className="font-bold mb-2 text-base text-blue-700 flex items-center gap-2">
            <span className="text-lg">🤖</span> AI 검색봇
          </div>
          <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-md p-2 min-h-[120px] max-h-[180px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.from === 'user'
                    ? 'flex justify-end mb-1'
                    : 'flex justify-start mb-1'
                }
              >
                <span
                  className={
                    'inline-block rounded-lg px-3 py-1 max-w-[80%] ' +
                    (msg.from === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-200 text-gray-800')
                  }
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="메시지를 입력하세요..."
              className="flex-1 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white rounded-md px-4 py-1 hover:bg-blue-700 transition-colors"
            >
              전송
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-2 text-gray-400 hover:text-gray-600 text-xs self-end"
          >
            닫기
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white rounded-full w-14 h-14 text-2xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="AI 검색봇 열기"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
