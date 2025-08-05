import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

const MyOrder = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 주문 내역 조회
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/me', {
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
          throw new Error('주문 내역 조회에 실패했습니다.');
        }

        const data = await response.json();
        console.log('주문 데이터:', data); // 날짜 형식 확인용 로그
        // 배열 형태의 날짜를 Date 객체로 변환하는 함수
        const parseDateFromArray = (dateArray) => {
          if (Array.isArray(dateArray)) {
            // [year, month, day, hour, minute, second, nano] 형태
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
            return new Date(year, month - 1, day, hour, minute, second); // month는 0-based
          }
          return new Date(dateArray);
        };

        // 최신순으로 정렬 (createdAt 기준 내림차순)
        console.log('정렬 전 데이터:', data.map(item => ({ 
          productName: item.productName, 
          createdAt: item.createdAt,
          parsedDate: parseDateFromArray(item.createdAt)
        })));
        
        const sortedOrders = data.sort((a, b) => {
          const dateA = parseDateFromArray(a.createdAt);
          const dateB = parseDateFromArray(b.createdAt);
          
          // 날짜가 유효하지 않은 경우 처리
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.error('Invalid date detected:', { a: a.createdAt, b: b.createdAt });
            return 0;
          }
          
          return dateB.getTime() - dateA.getTime(); // 최신순 (내림차순)
        });
        
        console.log('정렬 후 데이터:', sortedOrders.map(item => ({ 
          productName: item.productName, 
          createdAt: item.createdAt,
          parsedDate: parseDateFromArray(item.createdAt)
        })));
        setOrders(sortedOrders);
      } catch (err) {
        console.error('주문 내역 조회 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">내 구매내역</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">내 구매내역</h1>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">오류가 발생했습니다: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 구매내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">구매 내역이 없습니다.</div>
          <button 
            onClick={() => navigate('/commerce')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        paginatedOrders.map((order, index) => (
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
                <span className="mr-4">결제: {order.paymentMethod}</span>
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
                  onClick={() => navigate(`/mypage?mode=create&productId=${index}`)}
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
      {orders.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                currentPage === idx + 1 ? 'bg-blue-100 font-bold' : ''
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          ← 뒤로가기
        </button>
      </div>
    </div>
  );
};

export default MyOrder;
