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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/mypage?tab=order')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            주문 내역으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">주문 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => navigate('/mypage?tab=order')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            주문 내역으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
                 {/* 헤더 */}
         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
           <div className="flex items-center justify-between mb-4">
             <h1 className="text-2xl font-bold text-gray-900">주문 상세</h1>
           </div>
          
          {/* 주문 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">주문 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호:</span>
                  <span className="font-medium">{orderDetail.orderId}</span>
                </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-600">주문일:</span>
                   <span>{formatDate(orderDetail.orderCreatedAt)}</span>
                 </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이용일:</span>
                  <span>{formatDate(orderDetail.useDate)}</span>
                </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-600">결제수단:</span>
                   <span>{orderDetail.paymentMethod || '결제수단 없음'}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-600">주문상태:</span>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                     {orderDetail.orderStatus || '상태 없음'}
                   </span>
                 </div>
              </div>
            </div>
            
                         <div>
               <h2 className="text-lg font-semibold mb-3">구매자 정보</h2>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">이름:</span>
                   <span>{orderDetail.member?.name || '이름 없음'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">이메일:</span>
                   <span>{orderDetail.member?.email || '이메일 없음'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">연락처:</span>
                   <span>{orderDetail.member?.phone || '연락처 없음'}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

                 {/* 상품 목록 */}
         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
           <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
           <div className="space-y-4">
             {orderDetail.orderItems?.map((item, index) => (
               <div key={item.id} className="border rounded-lg p-4">
                 <div className="flex gap-4">
                   <img
                     src={item.productThumbnail || 'https://placehold.co/300x200?text=이미지없음'}
                     alt={item.productName}
                     className="w-24 h-24 rounded object-cover"
                   />
                   <div className="flex-1">
                     <h3 className="font-semibold text-lg mb-2">{item.productName || '상품명 없음'}</h3>
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
                         <div className="font-semibold text-lg text-blue-600">
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">결제 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 결제 정보 */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">결제 수단:</span>
                <span className="font-medium">{getDetailedPaymentMethodText(orderDetail.paymentMethod, orderDetail.paymentInfo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 결제 금액:</span>
                <span className="font-bold text-blue-600 text-lg">{formatPrice(orderDetail.totalPrice)}</span>
              </div>
              {orderDetail.paymentInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 키:</span>
                    <span className="font-mono text-sm">{orderDetail.paymentInfo.paymentKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">승인 일시:</span>
                    <span>{formatDateTime(orderDetail.paymentInfo.approvedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 상태:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      orderDetail.paymentInfo.status === 'DONE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetail.paymentInfo.status === 'DONE' ? '결제 완료' : orderDetail.paymentInfo.status}
                    </span>
                  </div>
                  {orderDetail.paymentInfo.receiptUrl && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">영수증:</span>
                      <a 
                        href={orderDetail.paymentInfo.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
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
                <div className="flex justify-between">
                  <span className="text-gray-600">공급가액:</span>
                  <span>{formatPrice(orderDetail.paymentInfo.suppliedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">부가세:</span>
                  <span>{formatPrice(orderDetail.paymentInfo.vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">부분취소 가능:</span>
                  <span className={orderDetail.paymentInfo.isPartialCancelable ? 'text-green-600' : 'text-red-600'}>
                    {orderDetail.paymentInfo.isPartialCancelable ? '가능' : '불가능'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 카드 결제 정보 */}
          {orderDetail.paymentInfo?.cardInfo && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold mb-3 text-gray-800">카드 결제 상세</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">카드번호:</span>
                    <span className="font-mono">{orderDetail.paymentInfo.cardInfo.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">발행사:</span>
                    <span>{orderDetail.paymentInfo.cardInfo.issuerCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">승인번호:</span>
                    <span className="font-mono">{orderDetail.paymentInfo.cardInfo.approveNo}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">할부:</span>
                    <span>
                      {orderDetail.paymentInfo.cardInfo.installmentMonths === 0 
                        ? '일시불' 
                        : `${orderDetail.paymentInfo.cardInfo.installmentMonths}개월`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">무이자:</span>
                    <span className={orderDetail.paymentInfo.cardInfo.isInterestFree ? 'text-green-600' : 'text-gray-600'}>
                      {orderDetail.paymentInfo.cardInfo.isInterestFree ? '무이자' : '일반'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">카드 타입:</span>
                    <span>{getCardTypeText(orderDetail.paymentInfo.cardInfo.cardType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">소유자:</span>
                    <span>{getOwnerTypeText(orderDetail.paymentInfo.cardInfo.ownerType)}</span>
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
              className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
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