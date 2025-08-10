import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikedProducts, toggleLike } from '../../../common/api/productApi';
import Pagination from '../../../common/util/Pagination';
import { MypageCommonStyles, MypageComponents, MypageIcons } from './MypageCommonStyles';

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
    <div className={MypageCommonStyles.pageContainer}>
      <MypageComponents.PageHeader 
        title="내가 좋아요한 상품" 
        subtitle="좋아요한 상품들을 한눈에 확인하세요"
      />

      {/* 로딩 상태 */}
      {loading && (
        <MypageComponents.Loading message="좋아요 목록을 불러오는 중..." />
      )}

      {/* 에러 상태 */}
      {error && (
        <MypageComponents.Error 
          message={error} 
          onRetry={() => loadLikedProducts(0)}
        />
      )}

      {/* 좋아요 목록이 비어있는 경우 */}
      {!loading && !error && likedProducts.length === 0 && (
        <MypageComponents.Empty
          icon={<MypageIcons.HeartOutline />}
          title="아직 좋아요한 상품이 없습니다"
          subtitle="마음에 드는 상품에 좋아요를 눌러보세요!"
          buttonText="상품 둘러보기"
          onButtonClick={() => navigate('/commerce')}
        />
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
                <div className="w-full aspect-square overflow-hidden rounded-t-lg bg-gray-200 cursor-pointer flex items-center justify-center" onClick={() => navigate(`/commerce/${product.id}`)}>
                  <img 
                    src={product.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                    alt="썸네일" 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                
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
                    <div className="text-lg font-semibold mb-1 cursor-pointer text-gray-900 hover:text-blue-600 truncate" onClick={() => navigate(`/commerce/${product.id}`)} title={product.title}>{product.title}</div>
                    <div className="text-gray-600 text-sm mb-2 line-clamp-2" title={product.description}>{product.description}</div>
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
