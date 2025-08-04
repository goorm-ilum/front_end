// CommercePayment.jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProductDetail } from '../../../common/api/productApi';

const CommercePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [optionCounts, setOptionCounts] = useState({});
  const [initialTotalPrice, setInitialTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState('');

  // 상품 상세 정보 로드
  const loadProductDetail = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('상품 상세 조회 중...', id);
      const response = await getProductDetail(id);
      console.log('상품 상세 응답:', response);
      
      // 백엔드 응답을 프론트엔드 구조로 변환 (CommerceDetail과 동일한 방식)
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

      // URL 파라미터에서 전달받은 정보 파싱
      const searchParams = new URLSearchParams(location.search);
      const initialDate = searchParams.get('date') || '';
      setSelectedDate(initialDate);

      // URL에서 전달받은 총 금액 정보
      const totalPriceParam = searchParams.get('totalPrice');
      if (totalPriceParam) {
        setInitialTotalPrice(parseInt(totalPriceParam, 10));
      }

      // URL에서 전달받은 옵션 정보 파싱
      const optionsParam = searchParams.get('options');
      const initialOptionCounts = {};
      
      if (optionsParam) {
        // "오전 출발:2,오후 출발:1" 형태의 문자열을 파싱
        optionsParam.split(',').forEach(optionStr => {
          const [optionName, count] = optionStr.split(':');
          if (optionName && count) {
            initialOptionCounts[optionName] = parseInt(count, 10);
          }
        });
      } else {
        // 기본값 설정
        transformedProduct.stocks.forEach(stock => {
          initialOptionCounts[stock.optionName] = 0;
        });
      }
      
      setOptionCounts(initialOptionCounts);
      
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProductDetail();
    }
  }, [id, location.search]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate(`/commerce/${id}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            상품 상세로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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

  const handleBack = () => navigate(`/commerce/${id}`);

  const updateOptionCount = (optionName, change) => {
    setOptionCounts(prev => ({
      ...prev,
      [optionName]: Math.max(0, (prev[optionName] || 0) + change),
    }));
  };

  const totalCount = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product.stocks.reduce((sum, stock) => {
    const count = optionCounts[stock.optionName] || 0;
    return sum + ((stock.discountPrice || stock.price) * count);
  }, 0);

  const selectedOptions = product.stocks.filter(stock => (optionCounts[stock.optionName] || 0) > 0);

  // 주문 생성 함수: 백엔드에 주문 생성 요청
  const createOrder = async () => {
    if (totalCount === 0 || !selectedDate) return alert('날짜와 옵션을 모두 선택해주세요.');

    setIsCreatingOrder(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          options: selectedOptions.map(opt => ({
            optionName: opt.optionName,
            quantity: optionCounts[opt.optionName],
          })),
          totalPrice: totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '주문 생성에 실패했습니다.');
      }

      const data = await response.json();
      console.log('주문 생성 응답:', data);
      
      // 주문 생성 성공 후 Checkout 페이지로 이동
      const params = new URLSearchParams({
        orderId: data.orderId,
        orderName: data.orderName,
        amount: data.totalPrice.toString(),
        customerEmail: data.customerEmail || ''
      });
      
      navigate(`/commerce/checkout?${params.toString()}`);
    } catch (err) {
      console.error(err);
      alert('주문 생성 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">예약 정보 확인</h1>
        <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 font-medium">
          ← 상품 상세로 돌아가기
        </button>
      </div>

      <div className="flex gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <img src={product.thumbnail} alt={product.title} className="w-24 h-24 object-cover rounded-lg" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h2>
          <p className="text-gray-600 text-sm">{product.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 날짜 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">날짜 선택</h3>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">투어 날짜</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-64"
            />
          </div>
        </div>

        {/* 옵션 및 수량 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">옵션 및 수량 선택</h3>
          <div className="space-y-4">
            {product.stocks.map((stock) => (
              <div key={stock.optionName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stock.optionName}</h4>
                  <div className="text-sm text-gray-600 mb-1">재고: {stock.stock}개</div>
                  <div className="text-blue-600 font-semibold">
                    {stock.discountPrice && stock.discountPrice !== stock.price ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm">{stock.price?.toLocaleString()}원</span>
                        <div className="text-lg">{stock.discountPrice?.toLocaleString()}원</div>
                      </div>
                    ) : (
                      <div className="text-lg">{stock.price?.toLocaleString()}원</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateOptionCount(stock.optionName, -1)}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    disabled={!selectedDate || (optionCounts[stock.optionName] || 0) === 0}
                  >-</button>
                  <span className="w-12 text-center font-medium">{optionCounts[stock.optionName] || 0}</span>
                  <button
                    onClick={() => updateOptionCount(stock.optionName, 1)}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    disabled={!selectedDate || (optionCounts[stock.optionName] || 0) >= stock.stock}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예약 정보 요약 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 정보 요약</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>투어 날짜:</span>
            <span className="font-medium">{selectedDate || '날짜를 선택해주세요'}</span>
          </div>
          {selectedOptions.length > 0 && (
            <>
              <div className="space-y-2">
                <span className="font-medium">선택한 옵션:</span>
                {selectedOptions.map((opt) => (
                  <div key={opt.optionName} className="flex justify-between ml-4">
                    <span>• {opt.optionName}</span>
                    <span className="font-medium">{optionCounts[opt.optionName]}개</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>총 결제 금액:</span>
                <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
              </div>
              {initialTotalPrice > 0 && initialTotalPrice !== totalPrice && (
                <div className="text-sm text-gray-500 mt-2">
                  * 상세 페이지에서 선택한 금액과 다를 수 있습니다. 현재 계산된 금액이 최종 결제 금액입니다.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 주문 생성 버튼 */}
      <button
        className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        onClick={createOrder}
        disabled={totalCount === 0 || !selectedDate || isCreatingOrder}
      >
        {isCreatingOrder ? '주문 생성 중...' : '주문 생성 및 결제'}
      </button>
    </section>
  );
};

export default CommercePayment;
