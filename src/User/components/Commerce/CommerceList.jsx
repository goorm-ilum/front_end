import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Pagination from '../../../common/Pagination';
import AISearchBot from '../../../common/AISearchBot';

const dummyProducts = [
  {
    id: '1',
    title: '서울 시티 투어',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    discountPrice: 22400,
    description: '서울의 주요 명소를 둘러보는 투어입니다. 전문 가이드와 함께 서울의 역사와 문화를 체험하세요.',
    options: ['오전 출발', '오후 출발'],
    dates: ['2024-06-10', '2024-06-11', '2024-06-12'],
    like: false,
    reviews: [
      { user: '홍길동', rating: 5, comment: '정말 재밌었어요!' },
      { user: '김영희', rating: 4, comment: '가이드님이 친절했어요.' },
    ],
    seller: {
      name: '하루하루투어',
      contact: 'help@harutour.com',
      description: '25년 경력의 일본 현지 투어 전문 업체. 믿을 수 있는 여행 파트너!'
    }
  },
  {
    id: '2',
    title: '에버랜드 입장권',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 48000,
    discountPrice: 38400,
    description: '에버랜드 자유이용권 티켓. 온 가족이 즐길 수 있는 테마파크!',
    options: ['1일권', '2일권'],
    dates: ['2024-06-15', '2024-06-16'],
    like: true,
    reviews: [
      { user: '박철수', rating: 5, comment: '아이들과 좋은 추억 만들었어요.' },
    ],
    seller: {
      name: '에버랜드 공식',
      contact: 'info@everland.com',
      description: '국내 최대 테마파크, 에버랜드 공식 판매처.'
    }
  },
  {
    id: '3',
    title: '한강 유람선',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    discountPrice: null,
    description: '한강에서 즐기는 유람선 체험. 서울의 야경을 만끽하세요.',
    options: ['주간', '야간'],
    dates: ['2024-06-20', '2024-06-21'],
    like: false,
    reviews: [
      { user: '이민수', rating: 4, comment: '야경이 정말 멋졌어요.' },
    ],
    seller: {
      name: '한강크루즈',
      contact: 'cruise@hangang.com',
      description: '서울 대표 유람선 서비스, 한강크루즈.'
    }
  },
  {
    id: '4',
    title: '부산 해운대 해수욕장',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    price: 15000,
    discountPrice: 12000,
    description: '부산의 대표 해수욕장, 해운대에서 즐기는 바다 체험.',
    options: ['일반', 'VIP'],
    dates: ['2024-07-01', '2024-07-02', '2024-07-03'],
    like: true,
    reviews: [
      { user: '김바다', rating: 5, comment: '바다가 너무 예뻐요!' },
      { user: '박해양', rating: 4, comment: '깨끗하고 좋았어요.' },
    ],
    seller: {
      name: '부산관광',
      contact: 'info@busan.com',
      description: '부산 관광의 모든 것, 부산관광.'
    }
  },
  {
    id: '5',
    title: '제주도 렌터카',
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=80',
    price: 35000,
    discountPrice: 28000,
    description: '제주도 자유여행을 위한 렌터카 서비스. 편리한 이동을 도와드립니다.',
    options: ['경차', '중형차', '대형차'],
    dates: ['2024-07-10', '2024-07-11', '2024-07-12'],
    like: false,
    reviews: [
      { user: '이제주', rating: 5, comment: '제주도 여행에 최고!' },
    ],
    seller: {
      name: '제주렌터카',
      contact: 'rent@jeju.com',
      description: '제주도 전문 렌터카 업체.'
    }
  },
  {
    id: '6',
    title: '경주 불국사 투어',
    thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80',
    price: 22000,
    discountPrice: 17600,
    description: '경주의 대표 사찰, 불국사를 둘러보는 문화 투어.',
    options: ['오전', '오후'],
    dates: ['2024-07-15', '2024-07-16'],
    like: true,
    reviews: [
      { user: '박문화', rating: 5, comment: '역사와 문화를 느낄 수 있어요.' },
      { user: '김전통', rating: 4, comment: '가이드 설명이 좋았어요.' },
    ],
    seller: {
      name: '경주문화투어',
      contact: 'culture@gyeongju.com',
      description: '경주 문화 유산 전문 투어 업체.'
    }
  },
  {
    id: '7',
    title: '강원도 스키장',
    thumbnail: 'https://images.unsplash.com/photo-1551524160-9d0c0c0c0c0c?auto=format&fit=crop&w=600&q=80',
    price: 45000,
    discountPrice: null,
    description: '강원도의 대표 스키장에서 즐기는 겨울 스포츠.',
    options: ['1일권', '2일권', '3일권'],
    dates: ['2024-12-01', '2024-12-02', '2024-12-03'],
    like: false,
    reviews: [
      { user: '김스키', rating: 5, comment: '스키 타기 최고!' },
    ],
    seller: {
      name: '강원스키',
      contact: 'ski@gangwon.com',
      description: '강원도 스키장 전문 업체.'
    }
  },
  {
    id: '8',
    title: '전주 한옥마을',
    thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80',
    price: 18000,
    discountPrice: 14400,
    description: '전주의 전통 한옥마을을 둘러보는 문화 체험.',
    options: ['일반', '가이드 포함'],
    dates: ['2024-08-01', '2024-08-02'],
    like: true,
    reviews: [
      { user: '이전통', rating: 4, comment: '전통 문화를 느낄 수 있어요.' },
    ],
    seller: {
      name: '전주한옥',
      contact: 'hanok@jeonju.com',
      description: '전주 한옥마을 전문 투어.'
    }
  },
  {
    id: '9',
    title: '여수 돌산공원',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    price: 12000,
    discountPrice: null,
    description: '여수의 아름다운 돌산공원에서 즐기는 자연 체험.',
    options: ['일반', '가이드 포함'],
    dates: ['2024-08-15', '2024-08-16'],
    like: false,
    reviews: [
      { user: '김여수', rating: 5, comment: '자연이 너무 아름다워요!' },
      { user: '박바다', rating: 4, comment: '해안 도로가 정말 예뻐요.' },
    ],
    seller: {
      name: '여수관광',
      contact: 'tour@yeosu.com',
      description: '여수 관광의 모든 것, 여수관광.'
    }
  },
  {
    id: '10',
    title: '속초 설악산',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    discountPrice: 22400,
    description: '속초의 대표 관광지, 설악산 등반 체험.',
    options: ['초급', '중급', '고급'],
    dates: ['2024-09-01', '2024-09-02', '2024-09-03'],
    like: true,
    reviews: [
      { user: '이산악', rating: 5, comment: '등반이 정말 재미있었어요!' },
      { user: '김등산', rating: 4, comment: '경치가 최고예요.' },
    ],
    seller: {
      name: '설악산투어',
      contact: 'climb@seorak.com',
      description: '설악산 전문 등반 투어 업체.'
    }
  },
  {
    id: '11',
    title: '대구 팔공산',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    price: 15000,
    discountPrice: null,
    description: '대구의 대표 산, 팔공산 트레킹 체험.',
    options: ['일반', '가이드 포함'],
    dates: ['2024-09-10', '2024-09-11'],
    like: false,
    reviews: [
      { user: '박대구', rating: 4, comment: '트레킹하기 좋았어요.' },
    ],
    seller: {
      name: '팔공산투어',
      contact: 'trek@palgon.com',
      description: '팔공산 전문 트레킹 업체.'
    }
  },
  {
    id: '12',
    title: '광주 무등산',
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=80',
    price: 18000,
    discountPrice: 14400,
    description: '광주의 상징, 무등산 등반 체험.',
    options: ['일반', '가이드 포함'],
    dates: ['2024-09-20', '2024-09-21'],
    like: true,
    reviews: [
      { user: '김광주', rating: 5, comment: '무등산이 정말 멋져요!' },
      { user: '이등산', rating: 4, comment: '경치가 아름다워요.' },
    ],
    seller: {
      name: '무등산투어',
      contact: 'tour@mudeung.com',
      description: '무등산 전문 투어 업체.'
    }
  },
];

const CommerceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  
  // 검색어 상태 추가
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("latest");

  // 좋아요 상태 관리 - 더미 데이터에 이미 like 속성이 있으므로 그대로 사용
  const [products, setProducts] = useState(dummyProducts);

  // AI 검색봇 핸들러 - 실제 서버에 fetch 요청 보내기
  const handleAISearch = async (query) => {
    console.log('AI 검색 쿼리:', query);
    setSearch(query);

    try {
      const response = await fetch('/api/products/aisearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI 검색 결과:', data);

      // 서버에서 받은 상품 리스트로 상태 업데이트 (상품 구조가 다르면 여기 맞춰서 조정)
      setProducts(data.products || []);
      setPage(1); // 검색 결과 나오면 페이지 1로 초기화

    } catch (error) {
      console.error('AI 검색 중 오류 발생:', error);
      // 에러 시에는 기존 데이터 유지하거나 알림 처리 등 가능
    }
  };

  // Home 페이지에서 AI 검색으로 넘어온 경우 처리
  useEffect(() => {
    if (location.state?.aiSearchQuery) {
      handleAISearch(location.state.aiSearchQuery);
      // state 초기화
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [currentProducts, setCurrentProducts] = useState([]);
  const itemsPerPage = 9; // 페이지당 아이템 개수

  // 검색 필터링 (간단히 제목/설명에 검색어 포함 여부)
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      (!search || product.title.includes(search) || product.description.includes(search)) &&
      (!date || product.dates.includes(date)) &&
      (!showOnlyLiked || product.like)
    );
  }, [products, search, date, showOnlyLiked]);

  // 전체 아이템 개수
  const totalItems = filteredProducts.length;

  // 좋아요 토글 함수
  const toggleLike = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, like: !product.like }
        : product
    ));
  };

  // filteredProducts가 변경될 때마다 현재 페이지 아이템 업데이트
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, page, itemsPerPage]);

  return (
    <section className="flex flex-col gap-6 items-stretch">
      {/* AI 검색봇 영역 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            AI 여행상품 검색
          </h3>
          <p className="text-gray-600">
            자연어로 원하는 여행상품을 쉽게 찾아보세요
          </p>
        </div>
        <AISearchBot 
          onSearch={handleAISearch}
          placeholder="예: 서울 근교 당일치기 투어, 제주도 렌터카 상품, 부산 해운대 액티비티..."
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-2 text-left text-gray-900">투어 상품 목록</h2>
      </div>

      {/* 여행지 선택 버튼들 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">인기 여행지</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[ /* 인기 여행지 버튼 배열 그대로 유지 */ ].map((destination, index) => (
            <button
              key={index}
              onClick={() => setSearch(destination.search)}
              className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group bg-white"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
                {destination.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* 필터 영역 */}
      <div className="flex flex-col gap-2 mb-4 w-full max-w-lg">

        <div className="flex flex-col mt-2">
          <label className="block text-sm mb-1 text-gray-700">어떤 상품을 찾고 계신가요?</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="어디로, 무엇을 찾으시나요?"
            className="p-2 border rounded w-full"
          />
        </div>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
          style={{ minWidth: '80px' }}
          onClick={() => handleAISearch(search)}  // 조회 버튼 클릭 시 AI 검색 호출
        >
          조회
        </button>
      </div>
      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentProducts.map(product => (
          <div
            key={product.id}
            className="border rounded-lg shadow hover:shadow-lg transition flex flex-col relative"
          >
            <img 
              src={product.thumbnail} 
              alt="썸네일" 
              className="w-full h-40 object-cover rounded-t-lg bg-gray-100 cursor-pointer" 
              onClick={() => navigate(`${product.id}`)}
            />
            
            {/* 좋아요 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(product.id);
              }}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                product.like 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-red-50'
              }`}
            >
              {product.like ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-lg font-semibold mb-1 cursor-pointer text-gray-900 hover:text-blue-600" onClick={() => navigate(`${product.id}`)}>{product.title}</div>
                <div className="text-gray-600 text-sm mb-2">{product.description}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-yellow-500 font-bold">★ {product.reviews && product.reviews.length > 0 ? (product.reviews.reduce((acc, cur) => acc + cur.rating, 0) / product.reviews.length).toFixed(1) : '-'}</span>
                <div className="text-right">
                  {product.discountPrice ? (
                    <div>
                      <span className="text-gray-400 line-through text-sm">{product.price.toLocaleString()}원</span>
                      <div className="text-red-600 font-bold">{product.discountPrice.toLocaleString()}원</div>
                    </div>
                  ) : (
                    <span className="text-blue-700 font-bold">{product.price.toLocaleString()}원</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 페이지네이션 */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        className="mt-6"
      />
    </section>
  );
};

export default CommerceList;