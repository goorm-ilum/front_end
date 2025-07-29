import { useState } from 'react';

const AISearchBot = ({ onSearch, placeholder = "여행에 대해 무엇이든 물어보세요...", className = "" }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:border-blue-300 focus-within:border-blue-500 transition-colors">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 p-4 pr-16 text-gray-700 placeholder-gray-400 resize-none border-none outline-none rounded-2xl bg-transparent"
            rows="1"
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AISearchBot; 