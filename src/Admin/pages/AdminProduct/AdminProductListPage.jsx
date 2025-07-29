// src/pages/admin/products/AdminProductListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../common/Pagination';

const AdminProductListPage = () => {
  // 1) 더미 데이터 생성 (11개)
  const dummyProducts = useMemo(() => {
    return Array.from({ length: 11 }, (_, idx) => {
      const id = idx + 1;
      const startDate = new Date(Date.now() - idx * 86400000) // 과거 날짜
        .toISOString()
        .split('T')[0];
      const endDate = new Date(Date.now() + (idx + 5) * 86400000)
        .toISOString()
        .split('T')[0];
      return {
        id,
        name: `상품 ${id}`,
        thumbnail: `https://picsum.photos/seed/${id}/100/100`,
        price: id * 10000,                                  
        discountPrice: id % 2 === 0 ? id * 9000 : '',      
        startDate,                                         
        endDate,                                           
        stock: id * 3,                                    
        isVisible: id % 2 === 0                          
      };
    });
  }, []);

  // 상태
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedProducts, setPagedProducts] = useState([]);
  const itemsPerPage = 10; // 페이지당 아이템 개수

  // 검색/필터/정렬 상태
  const [inputValue, setInputValue] = useState('');    // input 에 타이핑할 값
  const [searchTerm, setSearchTerm] = useState('');    // 실제 검색어
  const [filterStatus, setFilterStatus] = useState('all'); // all / visible / hidden
  const [sortKey, setSortKey] = useState('');              // '' / name / price / startDate
  const [sortOrder, setSortOrder] = useState('asc');       // asc / desc

  // 더미 데이터 세팅
  useEffect(() => {
    setProducts(dummyProducts);
    setLoading(false);
  }, [dummyProducts]);

  // 검색 버튼 눌렀을 때
  const handleSearch = e => {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  };

  // 검색 / 필터 / 정렬 로직
  const filteredSorted = useMemo(() => {
    let arr = [...products];

    // 검색
    if (searchTerm !== '') {
      const term = searchTerm.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(term));
    }

    // 정렬
    if (sortKey) {
      arr.sort((a, b) => {
        let va = a[sortKey];
        let vb = b[sortKey];

        if (sortKey === 'startDate') {
          va = new Date(va).getTime();
          vb = new Date(vb).getTime();
        }

        if (typeof va === 'string') {
          va = va.toLowerCase();
          vb = vb.toLowerCase();
        }

        if (va < vb) return sortOrder === 'asc' ? -1 : 1;
        if (va > vb) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [products, searchTerm, filterStatus, sortKey, sortOrder]);

  // 검색/필터/정렬 변경 시 페이징 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortKey, sortOrder]);

  // filteredSorted가 변경될 때마다 현재 페이지 아이템 업데이트
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPagedProducts(filteredSorted.slice(startIndex, endIndex));
  }, [filteredSorted, currentPage, itemsPerPage]);



  // 삭제 핸들러
  const handleDelete = id => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return <div className="p-6 text-center">로딩중…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">상품 관리</h1>
        <Link
          to="/admin/products/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          상품 등록
        </Link>
      </div>

      {/* 검색 / 필터 / 정렬 UI */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        {/* 검색 폼: flex-1 으로 최대한 넓히고 min-w-0 으로 잘리도록 */}
        <form onSubmit={handleSearch} className="flex flex-1 min-w-0 mr-2">
          <input
            type="text"
            placeholder="상품명 검색"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-grow min-w-0 border px-3 py-1 rounded-l"
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 whitespace-nowrap"
          >
            검색
          </button>
        </form>

        {/* 필터/정렬 셀렉트 */}
        <div className="flex space-x-2">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="">정렬 안 함</option>
            <option value="name">상품명 순</option>
            <option value="price">정상가 순</option>
            <option value="startDate">등록일 순</option>
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">썸네일</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">상품명</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">정상가</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">할인가</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">재고</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">상품등록일</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedProducts.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-sm text-gray-700">{p.id}</td>
                <td className="px-4 py-2">
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700 text-right">
                  ₩{p.price.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 text-right">
                  {p.discountPrice ? `₩${p.discountPrice.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 text-right">{p.stock}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {p.startDate}
                </td>
                <td className="px-4 py-2 text-sm text-center space-x-2">
                  <Link to={`/admin/products/detail/${p.id}`} className="text-blue-600 hover:underline">
                    수정
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {pagedProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 UI */}
      <Pagination
        totalItems={filteredSorted.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
};

export default AdminProductListPage;