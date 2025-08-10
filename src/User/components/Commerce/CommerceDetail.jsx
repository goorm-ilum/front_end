import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProductDetail, toggleLike } from '../../../common/api/productApi';
import SellerInfo from '../../../common/components/SellerInfo';

// 한국 시간 기준으로 날짜 문자열 생성 (공통 함수)
const getKoreaDateString = (date) => {
  // 로컬 시간 기준으로 직접 날짜 생성 (시간대 문제 완전 해결)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 달력 컴포넌트
const Calendar = ({ availableDates, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 현재 월의 첫 번째 날과 마지막 날
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // 달력 시작일 (이전 달의 날짜들 포함)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // 달력 끝일 (다음 달의 날짜들 포함)
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
  
  // 달력에 표시할 모든 날짜들
  const calendarDates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    calendarDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // 날짜가 재고가 있는 날짜인지 확인 (일관된 날짜 형식 사용)
  const isAvailableDate = (date) => {
    const dateString = getKoreaDateString(date);
    return availableDates.includes(dateString);
  };

  // 날짜가 오늘 이후인지 확인
  const isFutureDate = (date) => {
    const today = new Date();
    const todayString = getKoreaDateString(today);
    const dateString = getKoreaDateString(date);
    return dateString >= todayString;
  };

  // 지난 날짜인지 확인
  const isPastDate = (date) => {
    const today = new Date();
    const todayString = getKoreaDateString(today);
    const dateString = getKoreaDateString(date);
    return dateString < todayString;
  };
  
  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    if (isAvailableDate(date) && isFutureDate(date)) {
      // 일관된 날짜 형식 사용
      const dateString = getKoreaDateString(date);
      onDateSelect(dateString);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((date, index) => {
          const dateString = getKoreaDateString(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate === dateString;
          const isAvailable = isAvailableDate(date) && isFutureDate(date);
          const isPast = isPastDate(date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!isAvailable}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${isAvailable && !isSelected ? 'hover:bg-blue-100' : ''}
                ${!isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${isAvailable && !isSelected ? 'bg-green-50' : ''}
                ${isPast ? 'text-gray-400 bg-gray-100' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      
      {/* 범례 */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
          <span>재고 있음</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>선택됨</span>
        </div>
      </div>
    </div>
  );
};

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
        like: response.isLiked,
        sellerId: response.sellerId || response.memberId || response.userId, // 판매자 ID 추가 (다양한 필드명 지원)
        sellerName: response.sellerName, // 판매자 이름
        email: response.email, // 판매자 이메일
        phoneNum: response.phoneNum // 판매자 전화번호
      };
      
      setProduct(transformedProduct);
      setIsLiked(transformedProduct.like);
      
        // 재고가 있는 가장 빠른 날짜를 기본 선택
  if (transformedProduct.stocks.length > 0) {
    // 오늘 날짜 (한국 시간 기준)
    const today = new Date();
    const todayString = getKoreaDateString(today);
    
    // 재고가 있는 날짜들을 오늘 이후로 필터링하고 정렬
    const availableDates = transformedProduct.stocks
      .map(stock => stock.startDate)
      .filter((date, index, self) => self.indexOf(date) === index) // 중복 제거
      .filter(date => {
        // 날짜 문자열을 직접 비교 (한국 시간 기준)
        return date >= todayString; // 오늘 포함
      })
      .sort(); // 날짜순 정렬
    
    if (availableDates.length > 0) {
      // 가장 빠른 날짜 선택
      const earliestDate = availableDates[0];
      setSelectedDate(earliestDate);
      
      // 해당 날짜의 첫 번째 재고 옵션을 기본 선택
      const firstStockForDate = transformedProduct.stocks.find(stock => stock.startDate === earliestDate);
      if (firstStockForDate) {
        setSelectedStock(firstStockForDate);
      }
    } else {
      // 오늘 이후 재고가 없는 경우 첫 번째 재고 선택
      setSelectedStock(transformedProduct.stocks[0]);
      setSelectedDate(transformedProduct.stocks[0].startDate);
    }
    
    // 재고 옵션별 수량 초기화
    const initialCounts = {};
    transformedProduct.stocks.forEach(stock => {
      const key = `${stock.optionName}-${stock.startDate}`;
      initialCounts[key] = 0;
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

  const updateStockCount = (optionName, startDate, change) => {
    const key = `${optionName}-${startDate}`;
    setStockCounts(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + change),
    }));
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newDate) => {
    // 지난 날짜인지 확인 (한국 시간 기준)
    const today = new Date();
    const todayString = getKoreaDateString(today);
    
    // 날짜 문자열을 직접 비교 (한국 시간 기준)
    if (newDate < todayString) {
      console.log('지난 날짜는 선택할 수 없습니다.');
      return;
    }
    
    setSelectedDate(newDate);
    // 날짜 변경 시 옵션 개수 초기화
    if (product?.stocks) {
      const initialCounts = {};
      product.stocks.forEach(stock => {
        const key = `${stock.optionName}-${stock.startDate}`;
        initialCounts[key] = 0;
      });
      setStockCounts(initialCounts);
    }
  };

  // 재고가 있는 날짜들만 필터링
  const availableDates = product?.stocks
    ? product.stocks
        .map(stock => stock.startDate)
        .filter((date, index, self) => self.indexOf(date) === index) // 중복 제거
        .sort() // 날짜순 정렬
    : [];

  const totalCount = Object.values(stockCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product?.stocks ? product.stocks.reduce((sum, stock) => {
    const key = `${stock.optionName}-${stock.startDate}`;
    const count = stockCounts[key] || 0;
    return sum + ((stock.discountPrice || stock.price) * count);
  }, 0) : 0;

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

  return (
    <>
      <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow flex flex-col gap-8">
        {/* 뒤로가기 버튼 */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">상품 상세 페이지</h1>
          <button
            onClick={() => navigate('/commerce')}
            className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            투어 상품 목록으로
          </button>
        </div>

        {/* 썸네일 이미지 */}
        <div className="relative">
          <img 
            src={product.thumbnail || 'https://cdn-icons-png.flaticon.com/512/11573/11573069.png'} 
            alt={product.title} 
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = 'https://cdn-icons-png.flaticon.com/512/11573/11573069.png';
            }}
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
            {product?.hashtags && product.hashtags.length > 0 && (
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
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-bold text-gray-900 flex-1 min-w-0 mr-4 break-words">
                {product.title}
              </h2>
              <div className="flex items-center gap-3 flex-shrink-0">
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
          {product?.stocks && product.stocks.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 날짜 선택 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">날짜 선택</h4>
                  <Calendar 
                    availableDates={availableDates} 
                    selectedDate={selectedDate} 
                    onDateSelect={handleDateChange} 
                  />
                </div>

                {/* 재고 옵션 선택 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">옵션 선택</h4>
                  {selectedDate && product?.stocks ? (
                    <div className="space-y-4">
                      {product.stocks
                        .filter(stock => stock.startDate === selectedDate)
                        .map((stock) => (
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
                                onClick={() => updateStockCount(stock.optionName, stock.startDate, -1)}
                                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                                disabled={(stockCounts[`${stock.optionName}-${stock.startDate}`] || 0) === 0}
                              >-</button>
                              <span className="w-12 text-center font-medium">{stockCounts[`${stock.optionName}-${stock.startDate}`] || 0}</span>
                              <button
                                onClick={() => updateStockCount(stock.optionName, stock.startDate, 1)}
                                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                                disabled={(stockCounts[`${stock.optionName}-${stock.startDate}`] || 0) >= stock.stock}
                              >+</button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      날짜를 선택하면 옵션을 선택할 수 있습니다.
                    </div>
                  )}
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
              className={`px-6 py-3 rounded-lg font-semibold w-full transition-colors ${
                totalCount === 0 || !selectedDate
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={() => {
                if (totalCount > 0 && selectedDate) {
                  const selectedOptions = product.stocks.filter(stock => (stockCounts[`${stock.optionName}-${stock.startDate}`] || 0) > 0);
                  const optionsParam = selectedOptions.map(opt => `${opt.optionName}-${opt.startDate}:${stockCounts[`${opt.optionName}-${opt.startDate}`]}`).join(',');
                  navigate(`/commerce/${id}/payment?date=${selectedDate}&options=${optionsParam}&totalPrice=${totalPrice}`);
                }
              }}
              disabled={totalCount === 0 || !selectedDate}
            >
              예약진행
            </button>
          </div>
        </div>

        {/* 상품 이미지 갤러리 */}
        {product?.images && product.images.length > 0 && (
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
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/11573/11573069.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 판매자 정보 */}
        <SellerInfo 
          sellerId={product?.sellerId}
          sellerName={product?.sellerName}
          email={product?.email}
          phoneNum={product?.phoneNum}
        />

        {/* 리뷰 목록 */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">상품 후기</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {product?.reviews && product.reviews.length === 0 ? (
              <li className="text-gray-400">아직 후기가 없습니다.</li>
            ) : (
              product?.reviews?.map((review, idx) => {
                // 별점이 숫자가 아닌 경우 기본값 설정
                const rating = typeof review.rating === 'number' ? review.rating : 
                             typeof review.reviewStar === 'number' ? review.reviewStar : 0;
                
                return (
                  <li key={idx} className="border-b py-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {review.nickName || review.user || review.userName || '익명'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
                      </div>
                    </div>
                    <span className="text-gray-700">
                      {review.comment || review.content || '리뷰 내용이 없습니다.'}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* 상품 등록일 */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-500">
            상품 등록일: {product?.regDate ? new Date(product.regDate).toLocaleDateString('ko-KR') : ''}
          </div>
        </div>
      </section>


    </>
  );
};

export default CommerceDetail;

