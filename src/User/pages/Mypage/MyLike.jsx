import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikedProducts, toggleLike } from '../../../common/api/productApi';
import Pagination from '../../../common/Pagination';

const MyLike = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  // 좋아요 목록 로드
  const loadLikedProducts = async (pageNum = 0) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('좋아요 목록 조회 중...', { page: pageNum, size: itemsPerPage });
      const response = await getLikedProducts({
        page: pageNum,
        size: itemsPerPage
      });
      
      console.log('좋아요 목록 응답:', response);
      
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
        setLikedProducts(transformedProducts);
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
        setLikedProducts(transformedProducts);
        setTotalItems(response.totalElements || transformedProducts.length);
      } else {
        setLikedProducts([]);
        setTotalItems(0);
      }
      
    } catch (error) {
      console.error('좋아요 목록 조회 실패:', error);
      
      let errorMessage = '좋아요 목록을 불러오는데 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = '좋아요 목록을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
      setLikedProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 좋아요 목록 로드
  useEffect(() => {
    loadLikedProducts(0);
  }, []);

  // 좋아요 토글 함수
  const handleToggleLike = async (productId) => {
    try {
      console.log('좋아요 토글 중...', { productId });
      
      // 백엔드에 토글 요청
      await toggleLike(productId);
      console.log('좋아요 토글 완료');
      
      // 로컬 상태에서 해당 상품 제거 (좋아요 취소)
      setLikedProducts(prev => prev.filter(product => product.id !== productId));
      setTotalItems(prev => prev - 1);
      
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      
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
    loadLikedProducts(pageIndex);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">내가 좋아요한 상품</h2>
        <p className="text-gray-600">좋아요한 상품들을 한눈에 확인하세요</p>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">좋아요 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 좋아요 목록이 비어있는 경우 */}
      {!loading && !error && likedProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 좋아요한 상품이 없습니다</h3>
          <p className="text-gray-500 mb-4">마음에 드는 상품에 좋아요를 눌러보세요!</p>
          <button
            onClick={() => navigate('/commerce')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            상품 둘러보기
          </button>
        </div>
      )}

      {/* 좋아요 상품 목록 */}
      {!loading && !error && likedProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {likedProducts.map(product => (
              <div
                key={product.id}
                className="border rounded-lg shadow hover:shadow-lg transition flex flex-col relative"
              >
                <img 
                  src={product.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                  alt="썸네일" 
                  className="w-full h-40 object-cover rounded-t-lg bg-gray-100 cursor-pointer" 
                  onClick={() => navigate(`/commerce/${product.id}`)}
                />
                
                {/* 좋아요 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(product.id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-lg font-semibold mb-1 cursor-pointer text-gray-900 hover:text-blue-600" onClick={() => navigate(`/commerce/${product.id}`)}>{product.title}</div>
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

          {/* 페이지네이션 */}
          {totalItems > 0 && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={page}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyLike;
