import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
          headers: {
            'Content-Type': 'application/json',
          },
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
            {(() => {
              // 할인 전 총 금액 계산 (옵션 가격들의 합)
              const originalTotalPrice = orderDetail.orderItems?.reduce((sum, item) => {
                return sum + (item.unitPrice * item.quantity);
              }, 0) || 0;
              
              // 실제 결제 금액
              const actualPaymentPrice = orderDetail.totalPrice || 0;
              
              // 할인 금액 계산
              const discountAmount = originalTotalPrice - actualPaymentPrice;
              
              // 할인이 적용되었는지 확인 (할인 금액이 0보다 큰 경우)
              const hasDiscount = discountAmount > 0;
              
              return (
                <div className="space-y-3">
                                     {hasDiscount ? (
                     // 할인이 있는 경우: 총 금액, 할인 금액, 최종 결제 금액 표시
                     <>
                       <div className="flex justify-between items-center py-2">
                         <span className="text-gray-600">총 금액 (할인 전)</span>
                         <span className="text-lg font-medium line-through text-gray-500">
                           {formatPrice(originalTotalPrice)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b">
                         <span className="text-gray-600">할인 적용 금액</span>
                         <span className="text-lg font-medium text-red-600">
                           -{formatPrice(discountAmount)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-4">
                         <span className="text-lg font-semibold">총 결제금액</span>
                         <span className="text-2xl font-bold text-blue-600">
                           {formatPrice(actualPaymentPrice)}
                         </span>
                       </div>
                     </>
                  ) : (
                    // 할인이 없는 경우: 총 결제 금액만 표시
                    <div className="flex justify-between items-center py-4 border-t">
                      <span className="text-lg font-semibold">총 결제금액</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(actualPaymentPrice)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
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