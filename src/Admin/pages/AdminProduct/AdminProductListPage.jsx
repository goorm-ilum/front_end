import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '../../../common/util/Pagination';
import { getAdminProducts, searchAdminProducts, sortAdminProducts, deleteAdminProduct } from '../../../common/api/adminApi';
import MessagePopup from '../../../common/components/MessagePopup';
import SuccessModal from '../../../components/SuccessModal';
import ConfirmModal from '../../../common/components/ConfirmModal';

const AdminProductListPage = () => {
  const location = useLocation();
  
  // 상태
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', type: 'info' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({ productId: null, message: '' });

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedProducts, setPagedProducts] = useState([]);
  const itemsPerPage = 10; // 페이지당 아이템 개수

  // 검색/필터/정렬 상태
  const [inputValue, setInputValue] = useState('');    // input 에 타이핑할 값
  const [searchTerm, setSearchTerm] = useState('');    // 실제 검색어
  const [sortKey, setSortKey] = useState('updatedAt');     // 기본값: 등록일 순
  const [sortOrder, setSortOrder] = useState('desc');      // 기본값: 내림차순 (최신순)
  const [forceSearch, setForceSearch] = useState(0);      // 강제 검색 실행을 위한 카운터

  // 상태 초기화 함수
  const resetToInitialState = () => {
    setInputValue('');
    setSearchTerm('');
    setSortKey('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
    setError('');
    setForceSearch(prev => prev + 1);
  };

  // 상품 목록 로드 (기본)
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage - 1 // 백엔드는 0-based pagination
      };
      
      const response = await getAdminProducts(params);
      console.log('상품 목록 응답:', response);
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const transformedProducts = response.map(product => ({
        id: product.id,
        name: product.productName,
        thumbnail: product.thumbnailImageUrl,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.totalStock,
        updatedAt: product.updatedAt
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('상품 목록 로드 실패:', error);
      
      let errorMessage = '상품 목록을 불러오는데 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = '상품 목록을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    } finally {
      setLoading(false);
    }
  };

  // 상품 검색 (정렬 상태 유지)
  const searchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        keyword: searchTerm,
        sortBy: sortKey,
        ascending: sortOrder === 'asc',
        page: currentPage - 1
      };
      
      const response = await searchAdminProducts(params);
      console.log('상품 검색 응답:', response);
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const transformedProducts = response.map(product => ({
        id: product.id,
        name: product.productName,
        thumbnail: product.thumbnailImageUrl,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.totalStock,
        updatedAt: product.updatedAt
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('상품 검색 실패:', error);
      
      let errorMessage = '상품 검색에 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = '검색 결과를 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    } finally {
      setLoading(false);
    }
  };

  // 상품 정렬
  const sortProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        sortBy: sortKey,
        ascending: sortOrder === 'asc',
        page: currentPage - 1
      };
      
      const response = await sortAdminProducts(params);
      console.log('상품 정렬 응답:', response);
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const transformedProducts = response.map(product => ({
        id: product.id,
        name: product.productName,
        thumbnail: product.thumbnailImageUrl,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.totalStock,
        updatedAt: product.updatedAt
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('상품 정렬 실패:', error);
      
      let errorMessage = '상품 정렬에 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = '정렬할 상품을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상품 목록 로드
  useEffect(() => {
    if (searchTerm) {
      searchProducts();
    } else {
      sortProducts(); // 기본적으로 정렬된 목록을 보여줌
    }
  }, [currentPage, searchTerm, sortKey, sortOrder, forceSearch]);

  // forceRefresh 처리
  useEffect(() => {
    if (location.state?.forceRefresh) {
      resetToInitialState();
    }
  }, [location.state]);

  // 검색 버튼 눌렀을 때
  const handleSearch = e => {
    e.preventDefault();
    const keyword = inputValue.trim();
    
    // 같은 검색어라도 강제로 검색 실행 (재고 등이 변경되었을 수 있음)
    setSearchTerm(keyword); // 검색어가 없어도 검색 실행 (전체 목록 조회)
    setCurrentPage(1); // 검색 시 1페이지로 이동
    
    // 강제로 검색 실행을 위한 상태 추가
    setForceSearch(prev => prev + 1);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSortKey) => {
    setSortKey(newSortKey);
    setCurrentPage(1); // 정렬 변경 시 1페이지로 이동
  };

  // 정렬 순서 변경 핸들러
  const handleSortOrderChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1); // 정렬 순서 변경 시 1페이지로 이동
  };

  // 현재 페이지 아이템 설정
  useEffect(() => {
    setPagedProducts(products);
  }, [products]);



  // 삭제 확인 모달 표시
  const showDeleteConfirm = (id) => {
    setConfirmData({ 
      productId: id, 
      message: '정말 삭제하시겠습니까?' 
    });
    setShowConfirmModal(true);
  };

  // 삭제 실행
  const handleDeleteConfirm = async () => {
    const { productId } = confirmData;
    
    try {
      await deleteAdminProduct(productId);
      
      // 삭제 성공 시 성공 모달 표시
      setSuccessMessage('상품이 성공적으로 삭제되었습니다.');
      setShowSuccessModal(true);
      
      // 현재 상태에 맞게 목록 다시 로드
      if (searchTerm) {
        searchProducts();
      } else {
        sortProducts();
      }
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      
      let errorMessage = '상품 삭제에 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = '삭제할 상품을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">로딩중…</div>;
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // 현재 상태에 맞게 목록 다시 로드
    if (searchTerm) {
      searchProducts();
    } else {
      sortProducts();
    }
  };

  return (
    <div className="p-6 space-y-4">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={successMessage}
      />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="삭제 확인"
        message={confirmData.message}
        confirmText="삭제"
        cancelText="취소"
      />
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
             onChange={e => handleSortChange(e.target.value)}
             className="border px-3 py-1 rounded"
           >
             <option value="updatedAt">등록일 순</option>
             <option value="productName">상품명 순</option>
             <option value="price">정상가 순</option>
             <option value="discountPrice">할인가 순</option>
             <option value="totalStock">재고 순</option>
           </select>
          <select
            value={sortOrder}
            onChange={e => handleSortOrderChange(e.target.value)}
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
                  {new Date(p.updatedAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-2 text-sm text-center space-x-2">
                  <Link to={`/admin/products/detail/${p.id}`} className="text-blue-600 hover:underline">
                    수정
                  </Link>
                  <button onClick={() => showDeleteConfirm(p.id)} className="text-red-600 hover:underline">
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
        totalItems={products.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="mt-4"
      />

      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messageData.message}
        type={messageData.type}
      />
    </div>
  );
};

export default AdminProductListPage;