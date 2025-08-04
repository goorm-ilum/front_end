import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Pagination from '../../../common/Pagination';
import AISearchBot from '../../../common/AISearchBot';
import { getProductList, aiSearchProducts, toggleLike } from '../../../common/api/productApi';

const CommerceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  
  // 검색어 상태 추가
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("latest");

  // 상품 상태 관리
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9; // 페이지당 아이템 개수

  // 초기 상품 목록 로드
  const loadProducts = async (pageNum = 0, keyword = '') => {
    setLoading(true);
    setError('');
    
    try {
      console.log('상품 목록 조회 중...', { page: pageNum, size: itemsPerPage, keyword });
      const response = await getProductList({
        page: pageNum,
        size: itemsPerPage,
        keyword: keyword
      });
      
      console.log('상품 목록 응답:', response);
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      if (Array.isArray(response)) {
        // 배열 형태로 직접 받은 경우
        const transformedProducts = response.map(product => ({
          id: product.productId,
          title: product.productName,
          description: product.productDescription,
          thumbnail: product.thumbnailImageUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          rating: product.averageReviewStar,
          like: product.isLiked,
          reviews: [] // 리뷰 배열은 별도로 받아야 할 수 있음
        }));
        setProducts(transformedProducts);
        setTotalItems(transformedProducts.length);
      } else if (response.content) {
        // 페이지네이션 응답 구조인 경우
        const transformedProducts = response.content.map(product => ({
          id: product.productId,
          title: product.productName,
          description: product.productDescription,
          thumbnail: product.thumbnailImageUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          rating: product.averageReviewStar,
          like: product.isLiked,
          reviews: []
        }));
        setProducts(transformedProducts);
        setTotalItems(response.totalElements || transformedProducts.length);
      } else {
        setProducts([]);
        setTotalItems(0);
      }
      
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      
      // 더 자세한 에러 메시지 생성
      let errorMessage = '상품 목록을 불러오는데 실패했습니다.';
      
      if (error.response) {
        // 서버에서 응답이 왔지만 에러인 경우
        const status = error.response.status;
        const statusText = error.response.statusText;
        
        if (status === 403) {
          errorMessage = '접근 권한이 없습니다. (403)';
        } else if (status === 404) {
          errorMessage = 'API 엔드포인트를 찾을 수 없습니다. (404)';
        } else if (status === 500) {
          errorMessage = '서버 내부 오류가 발생했습니다. (500)';
        } else {
          errorMessage = `서버 오류: ${status} - ${statusText}`;
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else {
        // 요청 자체를 보내지 못한 경우
        errorMessage = `요청 오류: ${error.message}`;
      }
      
      setError(errorMessage);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadProducts(0, '');
  }, []);

  // AI 검색봇 핸들러
  const handleAISearch = async (query) => {
    console.log('AI 검색 쿼리:', query);
    setSearch(query);

    try {
      setLoading(true);
      const response = await aiSearchProducts(query);
      console.log('AI 검색 결과:', response);

      // 백엔드 응답 구조에 맞게 데이터 변환
      if (Array.isArray(response)) {
        const transformedProducts = response.map(product => ({
          id: product.productId,
          title: product.productName,
          description: product.productDescription,
          thumbnail: product.thumbnailImageUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          rating: product.averageReviewStar,
          like: product.isLiked,
          reviews: []
        }));
        setProducts(transformedProducts);
        setTotalItems(transformedProducts.length);
      } else if (response.content) {
        const transformedProducts = response.content.map(product => ({
          id: product.productId,
          title: product.productName,
          description: product.productDescription,
          thumbnail: product.thumbnailImageUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          rating: product.averageReviewStar,
          like: product.isLiked,
          reviews: []
        }));
        setProducts(transformedProducts);
        setTotalItems(response.totalElements || transformedProducts.length);
      } else {
        setProducts([]);
        setTotalItems(0);
      }
      
      setPage(1); // 검색 결과 나오면 페이지 1로 초기화

    } catch (error) {
      console.error('AI 검색 중 오류 발생:', error);
      setError('AI 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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

  // 검색 필터링 (간단히 제목/설명에 검색어 포함 여부)
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      (!search || product.title?.includes(search) || product.description?.includes(search)) &&
      (!date || product.dates?.includes(date)) &&
      (!showOnlyLiked || product.like)
    );
  }, [products, search, date, showOnlyLiked]);

  // 좋아요 토글 함수
  const handleToggleLike = async (productId) => {
    try {
      console.log('좋아요 토글 중...', { productId });
      
      // 백엔드에 토글 요청
      await toggleLike(productId);
      console.log('좋아요 토글 완료');
      
      // 로컬 상태 업데이트
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, like: !product.like }
          : product
      ));
      
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      
      // 에러 메시지 표시
      let errorMessage = '좋아요 처리 중 오류가 발생했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = '상품을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      alert(errorMessage);
    }
  };

  // 페이지 변경 시 API 호출
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const pageIndex = newPage - 1;
    loadProducts(pageIndex, search);
  };

  // 검색 버튼 클릭 시
  const handleSearch = () => {
    setPage(1);
    loadProducts(0, search);
  };

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
          onClick={handleSearch}
        >
          조회
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">상품을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 카드 리스트 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="border rounded-lg shadow hover:shadow-lg transition flex flex-col relative"
            >
              <img 
                src={product.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                alt="썸네일" 
                className="w-full h-40 object-cover rounded-t-lg bg-gray-100 cursor-pointer" 
                onClick={() => navigate(`${product.id}`)}
              />
              
              {/* 좋아요 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLike(product.id);
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
                  <span className="text-yellow-500 font-bold">★ {product.rating > 0 ? product.rating.toFixed(1) : '-'}</span>
                  <div className="text-right">
                    {product.discountPrice && product.discountPrice !== product.price ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm">{product.price?.toLocaleString()}원</span>
                        <div className="text-red-600 font-bold">{product.discountPrice?.toLocaleString()}원</div>
                      </div>
                    ) : (
                      <span className="text-blue-700 font-bold">{product.price?.toLocaleString()}원</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && !error && totalItems > 0 && (
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={page}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </section>
  );
};

export default CommerceList;