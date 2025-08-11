import React from 'react';

// 한국 시간 기준으로 날짜 문자열 생성 (공통 함수)
const getKoreaDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 달력 컴포넌트 (미리보기용)
const Calendar = ({ availableDates, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
  
  const calendarDates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    calendarDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const isAvailableDate = (date) => {
    const dateString = getKoreaDateString(date);
    return availableDates.includes(dateString);
  };

  const isFutureDate = (date) => {
    const today = new Date();
    const todayString = getKoreaDateString(today);
    const dateString = getKoreaDateString(date);
    return dateString >= todayString;
  };

  const isPastDate = (date) => {
    const today = new Date();
    const todayString = getKoreaDateString(today);
    const dateString = getKoreaDateString(date);
    return dateString < todayString;
  };
  
  const handleDateClick = (date) => {
    if (isAvailableDate(date) && isFutureDate(date)) {
      const dateString = getKoreaDateString(date);
      onDateSelect(dateString);
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 날짜들 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((date, index) => {
          const dateString = getKoreaDateString(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate === dateString;
          const isAvailable = isAvailableDate(date);
          const isFuture = isFutureDate(date);
          const isPast = isPastDate(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!isAvailable || !isFuture}
              className={`
                p-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                ${isAvailable && isFuture ? 'hover:bg-white/60 cursor-pointer' : ''}
                ${isSelected ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : ''}
                ${isAvailable && !isSelected && isFuture ? 'bg-green-100 text-green-700' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductPreviewModal = ({ isOpen, onClose, productData }) => {
  const [selectedDate, setSelectedDate] = React.useState('');
  const [stockCounts, setStockCounts] = React.useState({});

  // 모달이 열릴 때마다 상태 초기화 및 자동 날짜 선택
  React.useEffect(() => {
    if (isOpen && productData) {
      setStockCounts({});
      
      // 사용 가능한 날짜들 중 가장 빠른 날짜 자동 선택
      const availableDates = (productData.dateOptions || []).map(stock => stock.startDate);
      if (availableDates.length > 0) {
        // 오늘 날짜 기준으로 정렬하여 가장 빠른 날짜 선택
        const today = new Date();
        const todayString = getKoreaDateString(today);
        
        const sortedDates = availableDates
          .filter(date => date >= todayString)
          .sort();
        
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        } else {
          // 오늘 이후 날짜가 없으면 가장 빠른 날짜 선택
          setSelectedDate(availableDates.sort()[0]);
        }
      } else {
        setSelectedDate('');
      }
    }
  }, [isOpen, productData]);

  if (!isOpen || !productData) return null;

  // 가장 저렴한 할인가 계산
  const calculateLowestPrice = () => {
    const basePrice = parseInt(productData.price) || 0;
    const baseDiscountPrice = productData.discountPrice ? parseInt(productData.discountPrice) : null;
    
    // 날짜별 옵션이 없는 경우 기본 가격 반환
    if (!productData.dateOptions || productData.dateOptions.length === 0) {
      return { price: basePrice, discountPrice: baseDiscountPrice };
    }
    
    // 날짜별 옵션에서 가장 저렴한 가격 찾기
    let lowestPrice = Infinity;
    let lowestDiscountPrice = null;
    let lowestStockPrice = 0;
    
    productData.dateOptions.forEach(stock => {
      const stockPrice = parseInt(stock.price) || 0;
      const stockDiscountPrice = stock.discountPrice ? parseInt(stock.discountPrice) : null;
      
      // 유효한 가격이 있는 경우에만 처리
      if (stockPrice > 0) {
        // 할인가가 있는 경우 할인가를, 없는 경우 정가를 사용
        const effectivePrice = stockDiscountPrice || stockPrice;
        
        if (effectivePrice < lowestPrice) {
          lowestPrice = effectivePrice;
          lowestDiscountPrice = stockDiscountPrice;
          lowestStockPrice = stockPrice;
        }
      }
    });
    
    // 날짜별 옵션에서 유효한 가격을 찾지 못한 경우 기본 가격 사용
    if (lowestPrice === Infinity) {
      return { price: basePrice, discountPrice: baseDiscountPrice };
    }
    
    return { 
      price: lowestStockPrice, 
      discountPrice: lowestDiscountPrice 
    };
  };

  const { price: lowestPrice, discountPrice: lowestDiscountPrice } = calculateLowestPrice();

  // 미리보기용 상품 데이터 구성
  const previewProduct = {
    title: productData.productName || '상품명 미입력',
    description: productData.description || '상품 설명 미입력',
    price: lowestPrice,
    discountPrice: lowestDiscountPrice,
    countryName: productData.countryName || '국가 미선택',
    hashtags: productData.tags || [],
    thumbnail: productData.thumbnailPreview || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    images: productData.detailPreviews || [],
    stocks: productData.dateOptions || [],
    reviews: [],
    regDate: new Date().toISOString(),
    sellerId: 'preview',
    sellerName: '판매자 미리보기',
    email: 'preview@example.com',
    phoneNum: '010-0000-0000'
  };

  // 사용 가능한 날짜들 (미리보기용)
  const availableDates = previewProduct.stocks.map(stock => stock.startDate);

  // 총 수량과 가격 계산
  const totalCount = Object.values(stockCounts).reduce((sum, count) => sum + count, 0);
  
  // 더 간단한 방법으로 총 가격 계산
  let totalPrice = 0;
  console.log('=== 총 가격 계산 시작 ===');
  console.log('stockCounts:', stockCounts);
  console.log('stockCounts 키들:', Object.keys(stockCounts));
  console.log('stockCounts 값들:', Object.values(stockCounts));
  console.log('previewProduct.stocks:', previewProduct.stocks);
  console.log('selectedDate:', selectedDate);
  
  if (Object.keys(stockCounts).length === 0) {
    console.log('stockCounts가 비어있음!');
  }
  
  Object.entries(stockCounts).forEach(([key, count]) => {
    console.log(`키: ${key}, 수량: ${count}`);
    const parts = key.split('|');
    console.log('parts:', parts);
    
    if (parts.length >= 2) {
      const optionName = parts[0];
      const startDate = parts[1];
      console.log(`찾는 옵션: ${optionName}, 날짜: ${startDate}`);
      
      // 모든 stock을 확인해보기
      console.log('모든 stock 옵션명들:', previewProduct.stocks.map(s => s.optionName));
      console.log('모든 stock 날짜들:', previewProduct.stocks.map(s => s.startDate));
      
      const stock = previewProduct.stocks.find(s => s.optionName === optionName && s.startDate === startDate);
      console.log('찾은 stock:', stock);
      
      if (stock) {
        console.log('stock.price:', stock.price, 'stock.discountPrice:', stock.discountPrice);
        const price = stock.discountPrice ? parseInt(stock.discountPrice) : parseInt(stock.price);
        console.log('최종 price:', price);
        totalPrice += price * count;
        console.log(`계산: ${optionName} - ${startDate} - ${count}개 x ${price}원 = ${price * count}원`);
        console.log('현재 totalPrice:', totalPrice);
      } else {
        console.log('stock을 찾을 수 없음!');
        console.log('정확한 매칭을 위해 모든 stock 확인:');
        previewProduct.stocks.forEach((s, idx) => {
          console.log(`stock[${idx}]: optionName="${s.optionName}", startDate="${s.startDate}"`);
        });
      }
    }
  });
  
  console.log('최종 totalPrice:', totalPrice);

  const updateStockCount = (optionName, startDate, change, index) => {
    // 키 생성: 옵션명 + 날짜 (날짜에 하이픈이 있으므로 구분자로 | 사용)
    const key = `${optionName}|${startDate}`;
    const currentCount = stockCounts[key] || 0;
    const newCount = Math.max(0, currentCount + change);
    
    // 재고 수량을 초과하지 않도록 제한
    const stock = previewProduct.stocks.find(s => s.optionName === optionName && s.startDate === startDate);
    const maxStock = stock ? stock.stock : 0;
    const finalCount = Math.min(newCount, maxStock);
    
    console.log(`updateStockCount: ${optionName} - ${startDate}, change: ${change}, current: ${currentCount}, new: ${newCount}, final: ${finalCount}`);
    
    if (finalCount === 0) {
      const newStockCounts = { ...stockCounts };
      delete newStockCounts[key];
      setStockCounts(newStockCounts);
    } else {
      setStockCounts(prev => ({ ...prev, [key]: finalCount }));
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">상품 미리보기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 미리보기 내용 */}
        <div className="p-6">
          <section className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col gap-8">
            {/* 썸네일 이미지와 상품 정보를 3:7 비율로 배치 */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
              {/* 썸네일 이미지 - 왼쪽 (3/10) */}
              <div className="lg:col-span-3 relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4">
                <img 
                  src={previewProduct.thumbnail} 
                  alt={previewProduct.title} 
                  className="w-full aspect-square object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/11573/11573069.png';
                  }}
                />
                {/* 좋아요 버튼 (미리보기용) */}
                <button
                  className="absolute top-6 right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 bg-white/90 text-gray-600 hover:bg-red-50 shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* 상품 정보 - 오른쪽 (7/10) */}
              <div className="lg:col-span-7 flex flex-col gap-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
                {/* 제목과 좋아요, 국가 정보를 한 줄에 배치 */}
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex-1 min-w-0 mr-4 break-words">
                    {previewProduct.title}
                  </h2>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/30 rounded-full px-3 py-1 shadow-sm">❤️ 0</span>
                    <span className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/30 rounded-full px-3 py-1 shadow-sm">📍 {previewProduct.countryName}</span>
                  </div>
                </div>
                
                {/* 가격 정보 - 박스 하단에 배치 */}
                <div className="mt-auto pt-4 border-t border-gray-200/30">
                  {previewProduct.discountPrice && previewProduct.discountPrice !== previewProduct.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-lg">{previewProduct.price?.toLocaleString()}원</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{previewProduct.discountPrice?.toLocaleString()}원</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{previewProduct.price?.toLocaleString()}원</span>
                  )}
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            {previewProduct.hashtags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
                <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">해시태그</h4>
                <div className="flex flex-wrap gap-2">
                  {previewProduct.hashtags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 상품 설명 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
              <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">상품 설명</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{previewProduct.description}</p>
            </div>

            {/* 재고 옵션 선택 섹션 */}
            {previewProduct.stocks.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 날짜 선택 */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">날짜 선택</h4>
                    <Calendar 
                      availableDates={availableDates} 
                      selectedDate={selectedDate} 
                      onDateSelect={handleDateChange} 
                    />
                  </div>

                  {/* 재고 옵션 선택 */}
                  <div className="space-y-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
                    <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">옵션 선택</h4>
                    {selectedDate && previewProduct.stocks ? (
                      <div className="space-y-4">
                        {previewProduct.stocks
                          .filter(stock => stock.startDate === selectedDate)
                          .map((stock, index) => (
                            <div key={`${stock.optionName}-${stock.startDate}-${index}`} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl shadow-md">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{stock.optionName}</h5>
                                <div className="text-sm text-gray-600 mb-1">재고: {stock.stock}개</div>
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
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
                                   onClick={() => updateStockCount(stock.optionName, stock.startDate, -1, index)}
                                   className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 shadow-sm"
                                   disabled={(stockCounts[`${stock.optionName}|${stock.startDate}`] || 0) === 0}
                                 >-</button>
                                 <span className="w-12 text-center font-medium">{stockCounts[`${stock.optionName}|${stock.startDate}`] || 0}</span>
                                 <button
                                   onClick={() => updateStockCount(stock.optionName, stock.startDate, 1, index)}
                                   className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 shadow-sm"
                                   disabled={(stockCounts[`${stock.optionName}|${stock.startDate}`] || 0) >= stock.stock}
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
                  <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">총 결제 금액:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                )}

                {/* 예약진행 버튼 */}
                <div className="flex gap-3 mt-6">
                  <button
                    className="px-6 py-3 rounded-xl font-semibold w-full bg-gray-400 text-gray-600 cursor-not-allowed transition-all duration-300"
                    disabled
                  >
                    예약진행
                  </button>
                </div>
              </div>
            )}

            {/* 상품 이미지 갤러리 */}
            {previewProduct.images.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
                <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">상품 이미지</h3>
                
                {/* 이미지들 */}
                <div className="flex flex-col gap-4">
                  {previewProduct.images.map((image, index) => (
                    <div key={index} className="flex justify-center">
                      <img 
                        src={image} 
                        alt={`${previewProduct.title} ${index + 1}`}
                        className="w-full max-w-full h-auto object-contain rounded-xl shadow-lg"
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">판매자 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {previewProduct.sellerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{previewProduct.sellerName}</h4>
                    <p className="text-sm text-gray-600">{previewProduct.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  연락처: {previewProduct.phoneNum}
                </div>
              </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">상품 후기</h3>
              </div>
              <ul className="flex flex-col gap-2">
                <li className="text-gray-400">아직 후기가 없습니다.</li>
              </ul>
            </div>

            {/* 상품 등록일 */}
            <div className="border-t border-gray-200/30 pt-4 bg-white/40 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-gray-500">
                상품 등록일: {previewProduct.regDate ? new Date(previewProduct.regDate).toLocaleDateString('ko-KR') : ''}
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;
