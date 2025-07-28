// src/pages/admin/orders/AdminOrderListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const dummyOrders = [
  { id: 'ORD001', customer: '홍길동',    product: '노트북',          date: '2024-06-01', amount: 12000, payment: '카드',    status: '결제완료' },
  { id: 'ORD002', customer: '이영희',    product: '스마트폰',        date: '2024-06-02', amount: 35000, payment: '토스',    status: '결제완료' },
  { id: 'ORD003', customer: '김철수',    product: '블루투스 이어폰', date: '2024-06-03', amount: 22000, payment: '계좌이체', status: '결제완료' },
  { id: 'ORD004', customer: '박영수',    product: '휴대폰 케이스',   date: '2024-06-04', amount: 18000, payment: '카드',    status: '결제완료' },
  { id: 'ORD005', customer: '최민수',    product: '무선 마우스',     date: '2024-06-05', amount: 54000, payment: '카드',    status: '결제완료' },
  { id: 'ORD006', customer: '이은주',    product: '기계식 키보드',   date: '2024-06-06', amount: 15000, payment: '토스',    status: '결제완료' },
  { id: 'ORD007', customer: '정다인',    product: '스마트워치',      date: '2024-06-07', amount: 23000, payment: '계좌이체', status: '결제완료' },
  { id: 'ORD008', customer: '김진우',    product: 'USB-C 케이블',   date: '2024-06-08', amount: 31000, payment: '카드',    status: '결제완료' },
  { id: 'ORD009', customer: '한지민',    product: 'HDMI 케이블',    date: '2024-06-09', amount: 29000, payment: '카드',    status: '결제완료' },
  { id: 'ORD010', customer: '강호동',    product: '보조배터리',      date: '2024-06-10', amount: 42000, payment: '토스',    status: '결제완료' },
  { id: 'ORD011', customer: '유재석',    product: 'SD 카드',        date: '2024-06-11', amount: 33000, payment: '계좌이체', status: '결제완료' },
  { id: 'ORD012', customer: '송중기',    product: '외장 HDD',       date: '2024-06-12', amount: 27000, payment: '카드',    status: '결제완료' },
  { id: 'ORD013', customer: '이준기',    product: '모니터',          date: '2024-06-13', amount: 36000, payment: '토스',    status: '결제완료' },
  { id: 'ORD014', customer: '이정재',    product: '웹캠',            date: '2024-06-14', amount: 48000, payment: '계좌이체', status: '결제완료' },
  { id: 'ORD015', customer: '김우빈',    product: '헤드셋',          date: '2024-06-15', amount: 39000, payment: '카드',    status: '결제완료' },
];

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 검색 input 상태, 실제 검색어
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 정렬 / 필터
  const [sortKey, setSortKey] = useState('date');        // date / amount / id
  const [paymentFilter, setPaymentFilter] = useState(''); // '' / 카드 / 토스 / 계좌이체

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 더미 로드
  useEffect(() => {
    setOrders(dummyOrders);
    setLoading(false);
  }, []);

  // 검색 버튼 클릭
  const handleSearch = e => {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  };

  // 검색/필터/정렬 적용
  const processedOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.product.toLowerCase().includes(term)
      );
    }

    if (paymentFilter) {
      filtered = filtered.filter(o => o.payment === paymentFilter);
    }

    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'amount':
          return b.amount - a.amount;
        case 'id':
          return a.id.localeCompare(b.id);
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  }, [orders, searchTerm, paymentFilter, sortKey]);

  // 조건 바뀌면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, sortKey]);

  // 페이징 계산
  const totalPages = Math.max(1, Math.ceil(processedOrders.length / itemsPerPage));
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedOrders.slice(start, start + itemsPerPage);
  }, [processedOrders, currentPage]);

  if (loading) {
    return <div className="p-6 text-center">로딩중…</div>;
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
            <option value="카드">카드</option>
            <option value="토스">토스</option>
            <option value="계좌이체">계좌이체</option>
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
              <tr key={o.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.customer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.product}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.date}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                  ₩{o.amount.toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{o.payment}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                  {o.status}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                  <Link to={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline">
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
      <div className="flex justify-end items-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminOrderListPage;