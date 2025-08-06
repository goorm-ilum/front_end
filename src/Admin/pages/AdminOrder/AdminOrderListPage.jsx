// src/pages/admin/orders/AdminOrderListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from '../../../common/Pagination';
import { getAdminOrders } from '../../../common/api/orderApi';
import { useCustomLogin } from '../../../common/hook/useCustomLogin';

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLogin, moveToLogin } = useCustomLogin();
  const navigate = useNavigate();

  // 검색 input 상태, 실제 검색어
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 정렬 / 필터
  const [sortKey, setSortKey] = useState('date');        // date / amount / id
  const [paymentFilter, setPaymentFilter] = useState(''); // '' / 카드 / 토스 / 계좌이체

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedOrders, setPagedOrders] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(15); // 페이지당 아이템 개수

  // 체크박스 선택 상태
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

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

  // 행 클릭 핸들러
  const handleRowClick = (orderCode, event) => {
    // 체크박스 클릭 시에는 페이지 이동하지 않음
    if (event.target.type === 'checkbox') {
      return;
    }
    navigate(`/admin/orders/${orderCode}`);
  };

  // 개별 체크박스 핸들러
  const handleCheckboxChange = (orderCode) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderCode)) {
      newSelected.delete(orderCode);
    } else {
      newSelected.add(orderCode);
    }
    setSelectedOrders(newSelected);
    
    // 전체 선택 상태 업데이트
    setSelectAll(newSelected.size === pagedOrders.length && pagedOrders.length > 0);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (selectAll) {
      // 현재 페이지의 모든 항목 선택 해제
      const newSelected = new Set(selectedOrders);
      pagedOrders.forEach(order => newSelected.delete(order.orderCode));
      setSelectedOrders(newSelected);
      setSelectAll(false);
    } else {
      // 현재 페이지의 모든 항목 선택
      const newSelected = new Set(selectedOrders);
      pagedOrders.forEach(order => newSelected.add(order.orderCode));
      setSelectedOrders(newSelected);
      setSelectAll(true);
    }
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    if (selectedOrders.size === 0) {
      alert('다운로드할 주문을 선택해주세요.');
      return;
    }

    // 선택된 주문들만 필터링
    const selectedData = processedOrders.filter(order => 
      selectedOrders.has(order.orderCode)
    );

    // 엑셀 데이터 포맷팅
    const excelData = selectedData.map(order => ({
      '주문번호': order.orderCode,
      '주문자': order.memberName,
      '상품명': order.productName,
      '주문일': formatDate(order.createdAt),
      '금액': order.totalPrice,
      '결제수단': getPaymentMethodText(order.paymentMethod),
      '주문상태': getOrderStatusText(order.orderStatus)
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '선택된 주문목록');

    // 파일 생성 및 다운로드
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `선택된_주문목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
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
  }, [searchTerm, paymentFilter, sortKey, itemsPerPage]);

  // processedOrders가 변경될 때마다 현재 페이지 아이템 업데이트
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPagedOrders(processedOrders.slice(startIndex, endIndex));
  }, [processedOrders, currentPage, itemsPerPage]);

  // 페이지가 변경될 때마다 전체 선택 상태 업데이트
  useEffect(() => {
    const currentPageSelected = pagedOrders.filter(order => 
      selectedOrders.has(order.orderCode)
    ).length;
    setSelectAll(currentPageSelected === pagedOrders.length && pagedOrders.length > 0);
  }, [pagedOrders, selectedOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">로딩중...</div>
            <div className="text-sm text-gray-600 mt-2">주문 데이터를 불러오고 있습니다</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-red-600 mb-2">오류 발생</div>
            <div className="text-sm text-gray-600 text-center">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            주문 관리
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 선택된 항목 표시 및 엑셀 다운로드 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">선택된 항목</h2>
                <p className="text-sm text-gray-600">{selectedOrders.size}개 선택됨</p>
              </div>
            </div>
            <button
              onClick={handleExcelDownload}
              disabled={selectedOrders.size === 0}
              className="group px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>엑셀 다운로드</span>
            </button>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">검색 및 필터</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 검색 영역 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">상품명 검색</label>
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="검색할 상품명을 입력하세요"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-r-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  검색
                </button>
              </form>
            </div>

            {/* 필터 영역 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">정렬 및 필터</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
                >
                  <option value="date">주문일순</option>
                  <option value="amount">금액순</option>
                  <option value="id">주문번호순</option>
                </select>
                <select
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
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
                <select
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
                >
                  <option value={15}>15개씩 보기</option>
                  <option value={50}>50개씩 보기</option>
                  <option value={100}>100개씩 보기</option>
                  <option value={200}>200개씩 보기</option>
                  <option value={500}>500개씩 보기</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center p-6 pb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">주문 목록</h2>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '720px' }}>
            <table className="min-w-full divide-y divide-gray-200/30">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">주문번호</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">주문자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상품명</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">주문일</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">금액</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">결제수단</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">주문상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {pagedOrders.map((o, index) => (
                  <tr 
                    key={o.orderCode}
                    onClick={(e) => handleRowClick(o.orderCode, e)}
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(o.orderCode)}
                        onChange={() => handleCheckboxChange(o.orderCode)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">#{o.orderCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{o.memberName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium max-w-xs truncate" title={o.productName}>
                        {o.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(o.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₩{o.totalPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getPaymentMethodText(o.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        o.orderStatus === 'SUCCESS' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                          : o.orderStatus === 'PENDING'
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                          : o.orderStatus === 'FAILED'
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                      }`}>
                        {getOrderStatusText(o.orderStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
                {pagedOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">조건에 맞는 주문이 없습니다.</p>
                        <p className="text-gray-400 text-sm mt-1">검색 조건을 변경해 보세요.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이징 - 전체 아이템 수가 페이지 크기보다 클 때만 표시 */}
        {processedOrders.length > itemsPerPage && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-center">
              <Pagination
                totalItems={processedOrders.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                className="pagination-modern"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderListPage;