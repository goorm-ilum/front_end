import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../../../common/api/orderApi';
import { useCustomLogin } from '../../../common/hook/useCustomLogin';

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLogin, moveToLogin } = useCustomLogin();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isLogin) {
          setError('로그인이 필요합니다.');
          return;
        }
        
        const data = await getOrderDetail(orderId);
        console.log('주문 상세 데이터:', data); // 디버깅용 로그
        setOrder(data);
      } catch (err) {
        console.error('주문 상세 조회 실패:', err);
        
        if (err.message === '로그인이 필요합니다.') {
          setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          setTimeout(() => moveToLogin(), 2000);
        } else if (err.message === '관리자 권한이 필요합니다.') {
          setError('관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요.');
        } else {
          setError('주문 상세 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, isLogin]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // 배열인 경우 처리 (LocalDateTime이 배열로 직렬화된 경우)
      if (Array.isArray(dateString)) {
        const [year, month, day] = dateString;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      
      // 문자열인 경우 기존 처리
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('날짜 포맷팅 에러:', error, dateString);
      return '';
    }
  };

  // 결제수단 한글 변환
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

  const getDetailedPaymentMethodText = (paymentMethod, paymentDetail) => {
    if (!paymentDetail) return getPaymentMethodText(paymentMethod);
    
    switch (paymentMethod) {
      case 'CARD':
        return paymentDetail.cardCompany ? `${paymentDetail.cardCompany} 카드` : '카드';
      case 'EASY_PAY':
        return paymentDetail.easyPayProvider ? `${paymentDetail.easyPayProvider}` : '간편결제';
      case 'ACCOUNT':
        return paymentDetail.accountBank ? `${paymentDetail.accountBank} 계좌이체` : '계좌이체';
      default:
        return getPaymentMethodText(paymentMethod);
    }
  };

  // 카드 타입 한글 변환
  const getCardTypeText = (cardType) => {
    switch (cardType) {
      case '신용': return '신용카드';
      case '체크': return '체크카드';
      default: return cardType;
    }
  };

  // 소유자 타입 한글 변환
  const getOwnerTypeText = (ownerType) => {
    switch (ownerType) {
      case '개인': return '개인';
      case '법인': return '법인';
      default: return ownerType;
    }
  };

  // 날짜시간 포맷팅 함수 (주문일시용)
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜시간 포맷팅 에러:', error, dateTimeString);
      return '';
    }
  };

  // 주문상태 한글 변환
  const getOrderStatusText = (orderStatus) => {
    switch (orderStatus) {
      case 'PENDING': return '결제대기';
      case 'SUCCESS': return '예약확정';
      case 'FAILED': return '결제실패';
      case 'CANCELLED': return '예약취소';
      default: return orderStatus;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">로딩중...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-red-600">{error}</div>
    </div>
  );
  
  if (!order) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-red-600">주문을 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            주문 상세
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Order ID Badge */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">주문번호</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">#{order.orderCode}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                order.orderStatus === 'SUCCESS' 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                  : order.orderStatus === 'PENDING'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : order.orderStatus === 'FAILED'
                  ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
              }`}>
                {getOrderStatusText(order.orderStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Payment Information Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">고객 정보</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50/50 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">예약자명</span>
                <p className="font-semibold text-gray-900 text-lg mt-1">{order.buyerName}</p>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">이메일</span>
                <p className="font-semibold text-gray-900 text-lg mt-1">{order.buyerEmail}</p>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">전화번호</span>
                <p className="font-semibold text-gray-900 text-lg mt-1">{order.buyerPhoneNum || '정보 없음'}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">결제 정보</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50/50 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">주문일시</span>
                <p className="font-semibold text-gray-900 text-lg mt-1">{formatDateTime(order.orderDateTime)}</p>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">결제수단</span>
                <p className="font-semibold text-gray-900 text-lg mt-1">{getDetailedPaymentMethodText(order.paymentMethod, order.paymentDetail)}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">구매 금액 (할인 전)</span>
                    <span className="text-sm text-gray-500 line-through">₩{order.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">할인 금액</span>
                    <span className="text-sm font-bold text-red-600">-₩{order.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">총 결제금액</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₩{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Detail Information */}
        {order.paymentDetail && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 mb-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">결제 상세 정보</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 기본 결제 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">결제 기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">결제 키</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.paymentDetail.paymentKey}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">승인 일시</span>
                    <span className="text-gray-900">{formatDateTime(order.paymentDetail.approvedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">결제 상태</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentDetail.status === 'DONE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentDetail.status === 'DONE' ? '결제 완료' : order.paymentDetail.status}
                    </span>
                  </div>
                  {order.paymentDetail.receiptUrl && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">영수증</span>
                      <a 
                        href={order.paymentDetail.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        영수증 보기 →
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">부분취소 가능</span>
                    <span className={`font-medium ${order.paymentDetail.isPartialCancelable ? 'text-green-600' : 'text-red-600'}`}>
                      {order.paymentDetail.isPartialCancelable ? '가능' : '불가능'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 금액 상세 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">금액 상세</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">공급가액</span>
                    <span className="text-gray-900 font-medium">₩{order.paymentDetail.suppliedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">부가세</span>
                    <span className="text-gray-900 font-medium">₩{order.paymentDetail.vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">총 결제 금액</span>
                    <span className="text-lg font-bold text-blue-600">₩{order.paymentDetail.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 카드 결제 상세 정보 */}
            {order.paymentDetail.cardDetail && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">카드 결제 상세</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">카드번호</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.paymentDetail.cardDetail.cardNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">발행사</span>
                      <span className="text-gray-900">{order.paymentDetail.cardDetail.issuerCode}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">승인번호</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.paymentDetail.cardDetail.approveNo}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">카드 타입</span>
                      <span className="text-gray-900">{getCardTypeText(order.paymentDetail.cardDetail.cardType)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">할부</span>
                      <span className="text-gray-900">
                        {order.paymentDetail.cardDetail.installmentMonths === 0 
                          ? '일시불' 
                          : `${order.paymentDetail.cardDetail.installmentMonths}개월`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">무이자</span>
                      <span className={`font-medium ${order.paymentDetail.cardDetail.isInterestFree ? 'text-green-600' : 'text-gray-600'}`}>
                        {order.paymentDetail.cardDetail.isInterestFree ? '무이자' : '일반'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">소유자</span>
                      <span className="text-gray-900">{getOwnerTypeText(order.paymentDetail.cardDetail.ownerType)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">카드 결제 금액</span>
                      <span className="text-gray-900 font-medium">₩{order.paymentDetail.cardDetail.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Purchase History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">상품 구매 내역</h2>
          </div>
          <div className="space-y-6">
            {order.orderItems && order.orderItems.length > 0 ? (
              order.orderItems.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-2">{item.productName}</h3>
                      <div className="space-y-2">
                        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          옵션: {item.optionName}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          이용일: {formatDate(item.useDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-3 bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          <span className="text-sm text-gray-500 line-through">₩{item.originalPrice.toLocaleString()}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="text-sm font-bold text-red-600">₩{item.discountPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">₩{item.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">상품 정보가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="flex justify-start items-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="group px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>목록으로</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;