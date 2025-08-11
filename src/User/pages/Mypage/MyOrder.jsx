import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagePopup from '../../../common/components/MessagePopup';
import Pagination from '../../../common/util/Pagination';
import { getAuthHeaders } from '../../../common/util/jwtUtil';

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', type: 'info' });
  const navigate = useNavigate();

  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  // 주문 내역 조회
  const loadOrders = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders/me?page=${pageNum}&size=${itemsPerPage}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessageData({ message: '로그인이 필요합니다.', type: 'warning' });
          setShowMessagePopup(true);
          navigate('/');
          return;
        }
        throw new Error('주문 내역 조회에 실패했습니다.');
      }

      const data = await response.json();
      
      console.log('주문 내역 API 응답:', data);
      
      // 백엔드 응답 구조에 맞게 데이터 처리
      if (data.content) {
        // 페이지네이션 응답 구조
        console.log('주문 데이터 (페이지네이션):', data.content);
        setOrders(data.content);
        setTotalItems(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        // 배열 형태 응답
        console.log('주문 데이터 (배열):', data);
        setOrders(data);
        setTotalItems(data.length);
      } else {
        console.log('주문 데이터 없음');
        setOrders([]);
        setTotalItems(0);
      }
      
    } catch (err) {
      console.error('주문 내역 조회 오류:', err);
      setError(err.message);
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadOrders(0);
  }, [navigate]);

  // 페이지 변경 시 API 호출
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const pageIndex = newPage - 1;
    loadOrders(pageIndex);
  };

  // 리뷰 작성 버튼 클릭 핸들러
  const handleReviewClick = async (productId, orderId) => {
    try {
      console.log('리뷰 작성 버튼 클릭:', { productId, orderId });
      
      // 리뷰 작성 가능 여부를 먼저 확인
      const reviewResponse = await fetch(`/api/orders/${orderId}/review/form`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      console.log('리뷰 작성 폼 응답:', {
        status: reviewResponse.status,
        statusText: reviewResponse.statusText,
        ok: reviewResponse.ok
      });

      // 성공적인 응답인 경우 바로 리뷰 작성 페이지로 이동
      if (reviewResponse.ok) {
        navigate(`/mypage/review/create/${productId}?orderId=${orderId}`);
        return;
      }

      // 에러 상태 코드별 처리
      if (reviewResponse.status === 409) {
        // 이미 작성한 리뷰인 경우 팝업 표시
        setErrorMessage('이미 작성한 리뷰입니다. 내 리뷰에서 수정할 수 있습니다.');
        setShowErrorPopup(true);
        return;
      }

      if (reviewResponse.status === 403) {
        // 권한이 없는 경우 팝업 표시
        setErrorMessage('리뷰 작성 권한이 없습니다.');
        setShowErrorPopup(true);
        return;
      }

      if (reviewResponse.status === 404) {
        // 상품이 삭제된 경우 팝업 표시
        setErrorMessage('존재하지 않는 상품입니다.');
        setShowErrorPopup(true);
        return;
      }

      if (reviewResponse.status === 401) {
        // 로그인이 필요한 경우
        setErrorMessage('로그인이 필요합니다.');
        setShowErrorPopup(true);
        return;
      }

      // 기타 에러 상태
      console.error('예상치 못한 응답 상태:', reviewResponse.status);
      setErrorMessage('리뷰 작성 페이지 접근에 실패했습니다.');
      setShowErrorPopup(true);
    } catch (error) {
      console.error('리뷰 작성 버튼 클릭 오류:', error);
      // 네트워크 오류나 기타 오류의 경우에도 상품이 존재하지 않을 가능성이 높음
      setErrorMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setShowErrorPopup(true);
    }
  };

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  // 날짜 포맷팅 함수
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">주문 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => loadOrders(0)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          내 구매내역
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        <p className="text-gray-600 mt-4">구매한 상품들의 내역을 확인하세요</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">구매 내역이 없습니다</h3>
          <p className="text-gray-500 mb-6">아직 구매한 상품이 없어요. 다양한 상품을 둘러보세요!</p>
          <button
            onClick={() => navigate('/commerce')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                  {(order.thumbnailImageUrl || order.thumbnail || order.productThumbnail || order.thumbnailUrl || order.imageUrl || order.image) ? (
                    <img 
                      src={order.thumbnailImageUrl || order.thumbnail || order.productThumbnail || order.thumbnailUrl || order.imageUrl || order.image} 
                      alt={order.productName || "상품 이미지"} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: (order.thumbnailImageUrl || order.thumbnail || order.productThumbnail || order.thumbnailUrl || order.imageUrl || order.image) ? 'none' : 'flex' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-xl font-semibold text-gray-800">
                    {order.productName && order.productName.length > 20 ? `${order.productName.substring(0, 20)}...` : order.productName}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex gap-4">
                      <span>구매일: {formatDate(order.createdAt)}</span>
                      <span>결제: {getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    총 결제금액: {order.totalPrice.toLocaleString()}원
                  </div>

                  <div className="flex gap-3 mt-4 flex-wrap">
                    <button 
                      onClick={() => navigate(`/order-detail?orderId=${order.orderId}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium"
                    >
                      주문상세
                    </button>
                    <button 
                      onClick={() => handleReviewClick(order.productId, order.orderId)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium"
                    >
                      리뷰 작성
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium">
                      반품 접수요청
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalItems > 0 && (
        <div className="mt-8">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        </div>
      )}

      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showErrorPopup}
        onClose={handleClosePopup}
        message={errorMessage}
        type="warning"
      />
      
      {/* 일반 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messageData.message}
        type={messageData.type}
      />
    </div>
  );
};

export default MyOrder;
