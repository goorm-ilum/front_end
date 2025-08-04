import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProductDetail, toggleLike } from '../../../common/api/productApi';

const CommerceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockCounts, setStockCounts] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // 상품 상세 정보 로드
  const loadProductDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('상품 상세 조회 중...', id);
      const response = await getProductDetail(id);
      console.log('상품 상세 응답:', response);
      
      // 백엔드 응답을 프론트엔드 구조로 변환
      const transformedProduct = {
        id: response.productId,
        title: response.productName,
        description: response.shortDescription,
        thumbnail: response.thumbnailImageUrl,
        price: response.price,
        discountPrice: response.discountPrice,
        regDate: response.regDate,
        countryName: response.countryName,
        hashtags: response.hashtags || [],
        images: response.images || [],
        stocks: response.stocks || [],
        rating: response.averageReviewStar,
        reviews: response.reviews || [],
        like: response.isLiked
      };
      
      setProduct(transformedProduct);
      setIsLiked(transformedProduct.like);
      
      // 첫 번째 재고 옵션을 기본 선택
      if (transformedProduct.stocks.length > 0) {
        setSelectedStock(transformedProduct.stocks[0]);
        setSelectedDate(transformedProduct.stocks[0].startDate);
        
        // 재고 옵션별 수량 초기화
        const initialCounts = {};
        transformedProduct.stocks.forEach(stock => {
          initialCounts[stock.optionName] = 0;
        });
        setStockCounts(initialCounts);
      }
      
    } catch (error) {
      console.error('상품 상세 조회 실패:', error);
      
      let errorMessage = '상품 상세 정보를 불러오는데 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        
        if (status === 404) {
          errorMessage = '상품을 찾을 수 없습니다. (404)';
        } else if (status === 403) {
          errorMessage = '접근 권한이 없습니다. (403)';
        } else if (status === 500) {
          errorMessage = '서버 내부 오류가 발생했습니다. (500)';
        } else {
          errorMessage = `서버 오류: ${status} - ${statusText}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else {
        errorMessage = `요청 오류: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상품 정보 로드
  useEffect(() => {
    if (id) {
      loadProductDetail();
    }
  }, [id]);

  const handleToggleLike = async () => {
    try {
      console.log('좋아요 토글 중...', { productId: id });
      
      // 백엔드에 토글 요청
      await toggleLike(id);
      console.log('좋아요 토글 완료');
      
      // 로컬 상태 업데이트
      setIsLiked(!isLiked);
      
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

  const updateStockCount = (optionName, change) => {
    setStockCounts(prev => ({
      ...prev,
      [optionName]: Math.max(0, (prev[optionName] || 0) + change),
    }));
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/commerce')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
          <button 
            onClick={() => navigate('/commerce')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const totalCount = Object.values(stockCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product.stocks.reduce((sum, stock) => {
    const count = stockCounts[stock.optionName] || 0;
    return sum + ((stock.discountPrice || stock.price) * count);
  }, 0);

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow flex flex-col gap-8">
      {/* 썸네일 이미지 */}
      <div className="relative">
        <img 
          src={product.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
          alt={product.title} 
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        {/* 좋아요 버튼 */}
        <button
          onClick={handleToggleLike}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50'
          }`}
        >
          {isLiked ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-4">
        <div>       
          {/* 해시태그 */}
          {product.hashtags && product.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.hashtags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 제목과 좋아요, 국가 정보를 한 줄에 배치 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">{product.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 border border-gray-300 rounded-full px-3 py-1">❤️ {isLiked ? '1' : '0'}</span>
              <span className="text-sm text-gray-500 border border-gray-300 rounded-full px-3 py-1">📍 {product.countryName}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{product.description}</p>
          
          {/* 가격 정보 */}
          <div className="mb-4">
            {product.discountPrice && product.discountPrice !== product.price ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-lg">{product.price?.toLocaleString()}원</span>
                <span className="text-2xl font-bold text-red-600">{product.discountPrice?.toLocaleString()}원</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-700">{product.price?.toLocaleString()}원</span>
            )}
          </div>
        </div>
        
        {/* 재고 옵션 선택 섹션 */}
        {product.stocks && product.stocks.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 날짜 선택 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">날짜 선택</h4>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700">투어 날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  />
                </div>
              </div>

              {/* 재고 옵션 선택 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">옵션 선택</h4>
                <div className="space-y-4">
                  {product.stocks.map((stock) => (
                    <div key={stock.optionName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{stock.optionName}</h5>
                        <div className="text-sm text-gray-600 mb-1">재고: {stock.stock}개</div>
                        <div className="text-blue-600 font-semibold">
                          {stock.discountPrice && stock.discountPrice !== stock.price ? (
                            <div>
                              <span className="text-gray-400 line-through text-sm">{stock.price.toLocaleString()}원</span>
                              <div className="text-lg">{stock.discountPrice.toLocaleString()}원</div>
                            </div>
                          ) : (
                            <div className="text-lg">{stock.price.toLocaleString()}원</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateStockCount(stock.optionName, -1)}
                          className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                          disabled={!selectedDate || (stockCounts[stock.optionName] || 0) === 0}
                        >-</button>
                        <span className="w-12 text-center font-medium">{stockCounts[stock.optionName] || 0}</span>
                        <button
                          onClick={() => updateStockCount(stock.optionName, 1)}
                          className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                          disabled={!selectedDate || (stockCounts[stock.optionName] || 0) >= stock.stock}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 선택된 옵션의 총 가격 표시 */}
            {totalCount > 0 && (
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">총 결제 금액:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold w-full"
            onClick={() => {
              const selectedStocks = product.stocks.filter(stock => (stockCounts[stock.optionName] || 0) > 0);
              const stocksParam = selectedStocks.map(stock => `${stock.optionName}:${stockCounts[stock.optionName]}`).join(',');
              navigate(`/commerce/${id}/payment?date=${selectedDate}&stocks=${stocksParam}`);
            }}
            disabled={totalCount === 0 || !selectedDate}
          >
            예약진행
          </button>
        </div>
      </div>

      {/* 상품 이미지 갤러리 */}
      {product.images && product.images.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">상품 이미지</h3>
          
          {/* 이미지들 */}
          <div className="flex flex-col gap-4">
            {product.images.map((image, index) => (
              <div key={index}>
                <img 
                  src={image} 
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">상품 후기</h3>
        <ul className="flex flex-col gap-2">
          {product.reviews.length === 0 ? (
            <li className="text-gray-400">아직 후기가 없습니다.</li>
          ) : (
            product.reviews.map((review, idx) => (
              <li key={idx} className="border-b py-2 flex flex-col gap-1">
                <span className="font-medium text-gray-900">{review.user} <span className="text-yellow-400">{'★'.repeat(review.rating)}</span></span>
                <span className="text-gray-700">{review.comment}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 상품 등록일 */}
      <div className="border-t pt-4">
        <div className="text-sm text-gray-500">
          상품 등록일: {new Date(product.regDate).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </section>
  );
};

export default CommerceDetail;

