// src/pages/admin/orders/AdminOrderListPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../common/Pagination';
import { getAdminOrders } from '../../../common/api/orderApi';
import { useCustomLogin } from '../../../common/hook/useCustomLogin';

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLogin, moveToLogin } = useCustomLogin();

  // 검색 input 상태, 실제 검색어
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 정렬 / 필터
  const [sortKey, setSortKey] = useState('date');        // date / amount / id
  const [paymentFilter, setPaymentFilter] = useState(''); // '' / 카드 / 토스 / 계좌이체

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedOrders, setPagedOrders] = useState([]);
  const itemsPerPage = 10; // 페이지당 아이템 개수

  // API에서 주문 데이터 로드
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isLogin) {
          setError('로그인이 필요합니다.');
          return;
        }
        
        const data = await getAdminOrders();
        setOrders(data);
      } catch (err) {
        console.error('주문 데이터 로드 실패:', err);
        
        if (err.message === '로그인이 필요합니다.') {
          setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          setTimeout(() => moveToLogin(), 2000);
        } else if (err.message === '관리자 권한이 필요합니다.') {
          setError('관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요.');
        } else {
          setError('주문 데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLogin]); // moveToLogin 제거

  // 검색 버튼 클릭
  const handleSearch = e => {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  };

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
      case 'TOSSPAY': return '토스페이';
      case 'PAYCO': return '페이코';
      case 'KAKAO': return '카카오페이';
      case 'NAVER': return '네이버페이';
      case 'MOBILE': return '휴대폰결제';
      case 'UNKNOWN': return '알 수 없음';
      default: return paymentMethod;
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

  // 검색/필터/정렬 적용
  const processedOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.productName.toLowerCase().includes(term)
      );
    }

    if (paymentFilter) {
      const paymentText = getPaymentMethodText(paymentFilter);
      filtered = filtered.filter(o => getPaymentMethodText(o.paymentMethod) === paymentText);
    }

    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'amount':
          return b.totalPrice - a.totalPrice;
        case 'id':
          return a.orderCode.localeCompare(b.orderCode);
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [orders, searchTerm, paymentFilter, sortKey]);

  // 조건 바뀌면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, sortKey]);

  // processedOrders가 변경될 때마다 현재 페이지 아이템 업데이트
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPagedOrders(processedOrders.slice(startIndex, endIndex));
  }, [processedOrders, currentPage, itemsPerPage]);

  if (loading) {
    return <div className="p-6 text-center">로딩중…</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">주문 관리</h1>
      </div>

      {/* 검색 / 정렬 / 필터 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        {/* 검색 폼: flex-1으로 최대 확장, min-w-0으로 잘리도록 */}
        <form onSubmit={handleSearch} className="flex flex-1 min-w-0 mr-2">
          <input
            type="text"
            placeholder="상품명 검색"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-grow min-w-0 px-3 py-2 border rounded-l"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 whitespace-nowrap"
          >
            검색
          </button>
        </form>

        {/* 정렬 / 결제수단 필터 */}
        <div className="flex space-x-2">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="date">주문일순</option>
            <option value="amount">금액순</option>
            <option value="id">주문번호순</option>
          </select>
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">결제수단 전체</option>
            <option value="CARD">카드</option>
            <option value="ACCOUNT">계좌이체</option>
            <option value="TOSSPAY">토스페이</option>
            <option value="PAYCO">페이코</option>
            <option value="KAKAO">카카오페이</option>
            <option value="NAVER">네이버페이</option>
            <option value="MOBILE">휴대폰결제</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">주문번호</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">주문자</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">상품명</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">주문일</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">금액</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">결제수단</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">주문상태</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedOrders.map(o => (
              <tr key={o.orderCode}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.orderCode}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.memberName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.productName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                  ₩{o.totalPrice.toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{getPaymentMethodText(o.paymentMethod)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                  {getOrderStatusText(o.orderStatus)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                  <Link to={`/admin/orders/${o.orderCode}`} className="text-blue-600 hover:underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
            {pagedOrders.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  조건에 맞는 주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
      <Pagination
        totalItems={processedOrders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
};

export default AdminOrderListPage;