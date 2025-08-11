import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AISearchBot = ({ onSearch, placeholder = "여행에 대해 무엇이든 물어보세요...", className = "", isHomePage = false }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      
      try {
        if (isHomePage) {
          // HOME 페이지에서 검색 시 즉시 /commerce 페이지로 이동
          navigate('/commerce', { 
            state: { 
              aiSearchQuery: query.trim(),
              immediateAISearch: true 
            } 
          });
        } else {
          // 이미 /commerce 페이지에 있을 때는 직접 검색 실행
          await onSearch(query.trim(), true);
          setQuery('');
        }
      } catch (error) {
        console.error('AI 검색 중 오류 발생:', error);
      } finally {
        setIsSearching(false);
      }
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
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className={`absolute right-3 p-2 rounded-xl transition-colors ${
              isSearching 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : !query.trim()
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* 검색 중 상태 표시 */}
        {isSearching && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                {isHomePage ? '페이지 이동 중...' : 'AI가 검색 중입니다...'}
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AISearchBot; 