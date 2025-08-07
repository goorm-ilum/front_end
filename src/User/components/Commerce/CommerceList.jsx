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
  const [isAISearch, setIsAISearch] = useState(false);

  // 상품 상태 관리
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9; // 페이지당 아이템 개수

  // 페이지 새로고침 감지 및 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 페이지가 새로고침될 때 실행될 코드
      console.log('상품 목록 페이지 새로고침 감지');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 초기 상품 목록 로드
  const loadProducts = async (pageNum = 0, keyword = '') => {
    setLoading(true);
    setError('');
    setIsAISearch(false); // 일반 검색으로 플래그 해제
    
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

  // 상태 초기화 함수
  const resetToInitialState = () => {
    setSearch("");
    setDate("");
    setSort("latest");
    setIsAISearch(false);
    setPage(1);
    setError('');
  };

  // AI 검색봇 핸들러
  const handleAISearch = async (query) => {
    console.log('AI 검색 쿼리:', query);
    setSearch(query);
    setIsAISearch(true); // AI 검색 플래그 설정

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

  // 컴포넌트 마운트 시 초기 데이터 로드 (AI 검색 쿼리 고려)
  useEffect(() => {
    const aiSearchQuery = location.state?.aiSearchQuery;
    const forceRefresh = location.state?.forceRefresh;
    
    // AI 검색 쿼리가 있는 경우 - 일반 상품 로드 건너뛰고 AI 검색만 실행
    if (aiSearchQuery) {
      console.log('AI 검색 모드로 진입:', aiSearchQuery);
      resetToInitialState();
      setLoading(true); // AI 검색 대기 중 로딩 표시
      
      // AI 검색 직접 실행 (handleAISearch 함수 내용을 여기서 직접 실행)
      const executeAISearch = async () => {
        setSearch(aiSearchQuery);
        setIsAISearch(true);
        
        try {
          const response = await aiSearchProducts(aiSearchQuery);
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
          
          setPage(1);
        } catch (error) {
          console.error('AI 검색 중 오류 발생:', error);
          setError('AI 검색 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      
      executeAISearch();
      
      // state 초기화
      navigate(location.pathname, { replace: true });
    } 
    // 강제 새로고침인 경우
    else if (forceRefresh) {
      resetToInitialState();
      loadProducts(0, '');
    }
    // 일반 진입인 경우 (AI 검색이 아닐 때만 전체 상품 로드)
    else {
      resetToInitialState();
      loadProducts(0, '');
    }
  }, []);

  // location.state 변경 감지 (페이지 이동 시 AI 검색 처리)
  useEffect(() => {
    const aiSearchQuery = location.state?.aiSearchQuery;
    
    if (aiSearchQuery) {
      console.log('페이지 이동으로 인한 AI 검색:', aiSearchQuery);
      resetToInitialState();
      setLoading(true);
      
      const executeAISearch = async () => {
        setSearch(aiSearchQuery);
        setIsAISearch(true);
        
        try {
          const response = await aiSearchProducts(aiSearchQuery);
          console.log('AI 검색 결과:', response);

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
          
          setPage(1);
        } catch (error) {
          console.error('AI 검색 중 오류 발생:', error);
          setError('AI 검색 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      
      executeAISearch();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // 검색 필터링 (간단히 제목/설명에 검색어 포함 여부)
  const filteredProducts = useMemo(() => {
    // AI 검색 결과인 경우 필터링 건너뛰기
    if (isAISearch) {
      return products.filter(product =>
        (!date || product.dates?.includes(date)) &&
        (!showOnlyLiked || product.like)
      );
    }
    
    return products.filter(product =>
      (!search || product.title?.includes(search) || product.description?.includes(search)) &&
      (!date || product.dates?.includes(date)) &&
      (!showOnlyLiked || product.like)
    );
  }, [products, search, date, showOnlyLiked, isAISearch]);

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
    setIsAISearch(false); // 일반 검색으로 플래그 해제
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
          placeholder="예: 로맨틱한 여행지 추천, 가족과 함께하는 여행, 서울 근교 당일치기 투어"
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
          {isAISearch ? (
            // AI 검색 중일 때 - 밝고 경쾌한 메시지
            <div>
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
              </div>
              <div className="mt-4">
                <p className="text-xl font-semibold text-blue-600">
                  🤖 AI가 열심히 검색 중입니다!
                </p>
                <p className="mt-1 text-sm text-purple-500 font-medium">
                  최적의 여행상품을 찾고 있어요 ✨
                </p>
              </div>
            </div>
          ) : (
            // 일반 로딩 중일 때
            <div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">상품을 불러오는 중...</p>
            </div>
          )}
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 검색 결과 없음 상태 */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          {isAISearch ? (
            // AI 검색 결과 없음
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <span className="text-6xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                적합한 상품을 찾지 못했어요
              </h3>
              <p className="text-gray-600 mb-4">
                다른 키워드로 다시 검색해보시거나<br/>
                아래 예시를 참고해보세요
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  "로맨틱한 여행지 추천",
                  "가족과 함께하는 여행",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleAISearch(example)}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // 일반 검색 결과 없음
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <span className="text-6xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600">
                다른 키워드로 검색해보시거나<br/>
                검색어를 줄여서 시도해보세요
              </p>
            </div>
          )}
        </div>
      )}

      {/* 카드 리스트 */}
      {!loading && !error && filteredProducts.length > 0 && (
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
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                }}
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