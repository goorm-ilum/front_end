import AISearchBot from '../../common/AISearchBot';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  
  // 페이지 새로고침 감지 및 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 페이지가 새로고침될 때 실행될 코드
      console.log('홈 페이지 새로고침 감지');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const handleAISearch = (query) => {
    console.log('AI 검색 쿼리:', query);
    // AI 검색 시 CommerceList 페이지로 이동
    navigate('/commerce', { state: { aiSearchQuery: query } });
  };

  const handleExploreProducts = () => {
    navigate('/commerce');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 메인 소개 영역 */}
      <section className="relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* 메인 타이틀 */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                TalkTrip
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                여행상품 커머스 플랫폼
              </p>
            </div>

            {/* 서브 설명 */}
            <div className="mb-12">
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                전세계의 다양한 <span className="text-blue-600 font-semibold">투어/액티비티</span>를 만나보세요.
                <br />
                <span className="text-purple-600 font-semibold">AI 검색봇</span>으로 원하는 여행상품을 쉽게 찾아보세요.
              </p>
            </div>

            {/* 주요 기능 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <div 
                onClick={() => navigate('/commerce')}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">투어 & 액티비티</h3>
                <p className="text-gray-600 text-sm">전세계의 다양한 여행상품을 둘러보고 예약하세요</p>
              </div>

              <div 
                onClick={() => navigate('/chat')}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">실시간 채팅</h3>
                <p className="text-gray-600 text-sm">판매자와 실시간으로 소통하며 궁금한 점을 해결하세요</p>
              </div>
            </div>

            {/* 상품 둘러보기 버튼 */}
            <div className="mb-12">
              <button 
                onClick={handleExploreProducts}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
              >
                어떤 여행지를 찾고 계신가요? 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI 검색봇 영역 */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              AI 여행 ASSISTANT
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              원하는 여행상품을 쉽게 찾아보세요. <br></br>
              AI가 여러분의 질문을 이해하고 최적의 상품을 추천해드립니다.
            </p>
          </div>
          
          <AISearchBot 
            onSearch={handleAISearch}
            placeholder="예: 로맨틱한 여행지 추천, 가족과 함께하는 여행, 서울 근교 당일치기 투어"
            className="mb-8"
          />

          {/* 예시 질문들 */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              "로맨틱한 여행지 추천",
              "가족과 함께하는 여행",
              "서울 근교 당일치기 투어",
              "부산 해운대 액티비티"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => handleAISearch(example)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
