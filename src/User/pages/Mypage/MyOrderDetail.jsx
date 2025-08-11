import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthHeaders } from '../../../common/util/jwtUtil';

const MyOrderDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      const orderId = searchParams.get('orderId');
      console.log('주문 상세 조회:', orderId);
      
      if (!orderId) {
        setError('주문 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('로그인이 필요합니다.');
            navigate('/');
            return;
          }
          if (response.status === 404) {
            setError('주문 정보를 찾을 수 없습니다.');
            setLoading(false);
            return;
          }
          throw new Error('주문 상세 조회에 실패했습니다.');
        }

        const data = await response.json();
        console.log('주문 상세 데이터:', data);
        console.log('Payment Info:', data.paymentInfo);
        console.log('Order Items:', data.orderItems);
        setOrderDetail(data);
      } catch (err) {
        console.error('주문 상세 조회 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [searchParams, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    
    try {
      let date;
      
      if (Array.isArray(dateString)) {
        // 배열 형태인 경우 [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second); // month는 0-based
      } else if (typeof dateString === 'string') {
        // 문자열 형태인 경우
        date = new Date(dateString);
      } else if (dateString.year && dateString.month) {
        // 객체 형태인 경우 (예: {year: 2024, month: 1, day: 15})
        date = new Date(dateString.year, dateString.month - 1, dateString.day);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '날짜 오류';
      }
      
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      console.error('Date parsing error:', error, dateString);
      return '날짜 오류';
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '0원';
    }
    return price.toLocaleString() + '원';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '날짜 없음';
    
    try {
      let date;
      
      if (Array.isArray(dateTimeString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateTimeString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateTimeString === 'string') {
        date = new Date(dateTimeString);
      } else {
        date = new Date(dateTimeString);
      }
      
      if (isNaN(date.getTime())) {
        return '날짜 오류';
      }
      
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  const getPaymentMethodText = (paymentMethod) => {
    switch (paymentMethod) {
      case 'CARD': return '카드';
      case 'ACCOUNT': return '계좌이체';
      case 'EASY_PAY': return '간편결제';
      case 'MOBILE': return '휴대폰결제';
      case 'VIRTUAL_ACCOUNT': return '가상계좌';
      case 'UNKNOWN': return '알 수 없음';
      default: return paymentMethod;
    }
  };

  const getDetailedPaymentMethodText = (paymentMethod, paymentInfo) => {
    if (!paymentInfo) return getPaymentMethodText(paymentMethod);
    
    switch (paymentMethod) {
      case 'CARD':
        return paymentInfo.cardCompany ? `${paymentInfo.cardCompany} 카드` : '카드';
      case 'EASY_PAY':
        return paymentInfo.easyPayProvider ? `${paymentInfo.easyPayProvider}` : '간편결제';
      case 'ACCOUNT':
        return paymentInfo.accountBank ? `${paymentInfo.accountBank} 계좌이체` : '계좌이체';
      default:
        return getPaymentMethodText(paymentMethod);
    }
  };

  const getCardTypeText = (cardType) => {
    switch (cardType) {
      case '신용': return '신용카드';
      case '체크': return '체크카드';
      default: return cardType;
    }
  };

  const getOwnerTypeText = (ownerType) => {
    switch (ownerType) {
      case '개인': return '개인';
      case '법인': return '법인';
      default: return ownerType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/mypage?tab=order')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            주문 내역으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">주문 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => navigate('/mypage?tab=order')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            주문 내역으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            주문 상세
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">주문 정보와 결제 내역을 확인하세요</p>
        </div>

        {/* 주문 기본 정보 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            주문 정보
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">주문 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">주문번호:</span>
                  <span className="font-semibold text-gray-800">{orderDetail.orderId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">주문일:</span>
                  <span className="text-gray-800">{formatDate(orderDetail.orderCreatedAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">이용일:</span>
                  <span className="text-gray-800">{formatDate(orderDetail.useDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">결제수단:</span>
                  <span className="text-gray-800">{orderDetail.paymentMethod || '결제수단 없음'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">주문상태:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {orderDetail.orderStatus || '상태 없음'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">구매자 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">이름:</span>
                  <span className="text-gray-800">{orderDetail.member?.name || '이름 없음'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">이메일:</span>
                  <span className="text-gray-800">{orderDetail.member?.email || '이메일 없음'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">연락처:</span>
                  <span className="text-gray-800">{orderDetail.member?.phone || '연락처 없음'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            주문 상품
          </h2>
          
          <div className="space-y-4">
            {orderDetail.orderItems?.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-white/50">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                    <img
                      src={item.productThumbnail || 'https://placehold.co/300x200?text=이미지없음'}
                      alt={item.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">
                      {item.productName && item.productName.length > 25 ? `${item.productName.substring(0, 25)}...` : item.productName || '상품명 없음'}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2">
                      옵션: {item.optionName || '옵션 없음'}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        수량: {item.quantity || 0}개
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          개당 {formatPrice(item.unitPrice)}
                        </div>
                        <div className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(item.totalItemPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-4">주문 상품이 없습니다.</p>}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            결제 정보
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 결제 정보 */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">결제 수단:</span>
                <span className="font-semibold text-gray-800">{getDetailedPaymentMethodText(orderDetail.paymentMethod, orderDetail.paymentInfo)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">총 결제 금액:</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(orderDetail.totalPrice)}</span>
              </div>
              {orderDetail.paymentInfo && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">결제 키:</span>
                    <span className="font-mono text-sm text-gray-800">{orderDetail.paymentInfo.paymentKey}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">승인 일시:</span>
                    <span className="text-gray-800">{formatDateTime(orderDetail.paymentInfo.approvedAt)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">결제 상태:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      orderDetail.paymentInfo.status === 'DONE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetail.paymentInfo.status === 'DONE' ? '결제 완료' : orderDetail.paymentInfo.status}
                    </span>
                  </div>
                  {orderDetail.paymentInfo.receiptUrl && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 font-medium">영수증:</span>
                      <a 
                        href={orderDetail.paymentInfo.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        영수증 보기
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 상세 결제 정보 */}
            {orderDetail.paymentInfo && (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">공급가액:</span>
                  <span className="text-gray-800">{formatPrice(orderDetail.paymentInfo.suppliedAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">부가세:</span>
                  <span className="text-gray-800">{formatPrice(orderDetail.paymentInfo.vat)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">부분취소 가능:</span>
                  <span className={orderDetail.paymentInfo.isPartialCancelable ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {orderDetail.paymentInfo.isPartialCancelable ? '가능' : '불가능'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 카드 결제 정보 */}
          {orderDetail.paymentInfo?.cardInfo && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                카드 결제 상세
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">카드번호:</span>
                    <span className="font-mono text-gray-800">{orderDetail.paymentInfo.cardInfo.cardNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">발행사:</span>
                    <span className="text-gray-800">{orderDetail.paymentInfo.cardInfo.issuerCode}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">승인번호:</span>
                    <span className="font-mono text-gray-800">{orderDetail.paymentInfo.cardInfo.approveNo}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">할부:</span>
                    <span className="text-gray-800">
                      {orderDetail.paymentInfo.cardInfo.installmentMonths === 0 
                        ? '일시불' 
                        : `${orderDetail.paymentInfo.cardInfo.installmentMonths}개월`}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">무이자:</span>
                    <span className={orderDetail.paymentInfo.cardInfo.isInterestFree ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                      {orderDetail.paymentInfo.cardInfo.isInterestFree ? '무이자' : '일반'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">카드 타입:</span>
                    <span className="text-gray-800">{getCardTypeText(orderDetail.paymentInfo.cardInfo.cardType)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">소유자:</span>
                    <span className="text-gray-800">{getOwnerTypeText(orderDetail.paymentInfo.cardInfo.ownerType)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/mypage?tab=order')}
            className="bg-white/80 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-xl hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center border border-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            주문 내역으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetail; 