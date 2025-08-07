import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagePopup from '../../../common/components/MessagePopup';
import Pagination from '../../../common/util/Pagination';
import { MypageCommonStyles, MypageComponents, MypageIcons } from './MypageCommonStyles';



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
        headers: { 'Content-Type': 'application/json' },
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
      
      // 백엔드 응답 구조에 맞게 데이터 처리
      if (data.content) {
        // 페이지네이션 응답 구조
        setOrders(data.content);
        setTotalItems(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        // 배열 형태 응답
        setOrders(data);
        setTotalItems(data.length);
      } else {
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
  const handleReviewClick = async (productId) => {
    try {
      // 리뷰 작성 가능 여부를 확인하기 위해 API 호출
      const response = await fetch(`/api/products/${productId}/reviews/form`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 403) {
        // 이미 작성한 리뷰인 경우 팝업 표시
        setErrorMessage('이미 작성한 리뷰입니다.');
        setShowErrorPopup(true);
        return;
      }

      if (!response.ok) {
        throw new Error('리뷰 작성 페이지 접근에 실패했습니다.');
      }

      // 리뷰 작성 가능한 경우 리뷰 작성 페이지로 이동
      navigate(`/mypage/review/create/${productId}`);
    } catch (error) {
      console.error('리뷰 작성 버튼 클릭 오류:', error);
      setErrorMessage('리뷰 작성 페이지 접근에 실패했습니다.');
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
      <div className={MypageCommonStyles.pageContainer}>
        <MypageComponents.PageHeader 
          title="내 구매내역" 
          subtitle="구매한 상품들의 내역을 확인하세요"
        />
        <MypageComponents.Loading message="주문 내역을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={MypageCommonStyles.pageContainer}>
        <MypageComponents.PageHeader 
          title="내 구매내역" 
          subtitle="구매한 상품들의 내역을 확인하세요"
        />
        <MypageComponents.Error 
          message={`오류가 발생했습니다: ${error}`} 
          onRetry={() => loadOrders(0)}
        />
      </div>
    );
  }

  return (
    <div className={MypageCommonStyles.pageContainer}>
      <MypageComponents.PageHeader 
        title="내 구매내역" 
        subtitle="구매한 상품들의 내역을 확인하세요"
      />

      {orders.length === 0 ? (
        <MypageComponents.Empty
          icon={<MypageIcons.Order />}
          title="구매 내역이 없습니다"
          subtitle="아직 구매한 상품이 없어요. 다양한 상품을 둘러보세요!"
          buttonText="쇼핑하러 가기"
          onButtonClick={() => navigate('/commerce')}
        />
      ) : (
        orders.map((order, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 mb-6 shadow-sm flex gap-4"
          >
            <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-lg font-semibold">{order.productName}</div>
              <div className="text-sm text-gray-600">
                <span className="mr-4">구매일: {formatDate(order.createdAt)}</span>
                <span className="mr-4">결제: {getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              <div className="text-lg font-bold text-blue-700">
                총 결제금액: {order.totalPrice.toLocaleString()}원
              </div>

                          <div className="flex gap-2 mt-2 flex-wrap">
              <button 
                onClick={() => navigate(`/order-detail?orderId=${order.orderId}`)}
                className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm"
              >
                주문상세
              </button>
                <button 
                  onClick={() => handleReviewClick(order.productId)}
                  className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm"
                >
                  리뷰 작성
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm">
                  반품 접수요청
                </button>
              </div>
            </div>
          </div>
        ))
              )}

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
