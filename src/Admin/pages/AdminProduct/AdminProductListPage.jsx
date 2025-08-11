import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '../../../common/util/Pagination';
import { getAdminProducts, searchAdminProducts, sortAdminProducts, deleteAdminProduct, restoreAdminProduct } from '../../../common/api/adminApi';
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
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // 페이지당 아이템 개수

  // 검색/필터/정렬 상태
  const [inputValue, setInputValue] = useState('');    // input 에 타이핑할 값
  const [searchTerm, setSearchTerm] = useState('');    // 실제 검색어
  const [sortKey, setSortKey] = useState('updatedAt');     // 기본값: 등록일 순
  const [sortOrder, setSortOrder] = useState('desc');      // 기본값: 내림차순 (최신순)
  const [statusFilter, setStatusFilter] = useState('ALL'); // 상태 필터: ALL, ACTIVE, DELETED
  const [forceSearch, setForceSearch] = useState(0);      // 강제 검색 실행을 위한 카운터

  // 상태 초기화 함수
  const resetToInitialState = () => {
    setInputValue('');
    setSearchTerm('');
    setSortKey('updatedAt');
    setSortOrder('desc');
    setStatusFilter('ALL');
    setCurrentPage(1);
    setTotalPages(0);
    setTotalItems(0);
    setError('');
    setForceSearch(prev => prev + 1);
  };

  // 상품 목록 로드 (기본)
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
                   const params = {
        page: currentPage - 1, // 백엔드는 0-based pagination (1페이지 클릭 시 0 전달)
        size: 10, // 페이지당 10개 아이템
        sortBy: sortKey,
        ascending: sortOrder === 'asc',
        status: statusFilter // ALL을 포함한 모든 상태값을 백엔드로 전달
      };
      
             const response = await getAdminProducts(params);
       console.log('상품 목록 응답:', response);
       
       // 백엔드 응답 구조에 맞게 데이터 변환
       const productsData = response.content || [];
       const transformedProducts = productsData.map(product => ({
         id: product.id,
         name: product.productName,
         thumbnail: product.thumbnailImageUrl,
         price: product.price,
         discountPrice: product.discountPrice,
         stock: product.totalStock,
         updatedAt: product.updatedAt,
         status: product.isDeleted ? 'DELETED' : 'ACTIVE' // isDeleted 필드 기반으로 상태 설정
       }));
       
       setProducts(transformedProducts);
       
       // 페이지네이션 정보 설정
       setTotalPages(response.totalPages || 0);
       setTotalItems(response.totalElements || 0);
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
        page: currentPage - 1, // 백엔드는 0-based pagination (1페이지 클릭 시 0 전달)
        size: 10 // 페이지당 10개 아이템
      };
      
             const response = await searchAdminProducts(params);
       console.log('상품 검색 응답:', response);
       
       // 백엔드 응답 구조에 맞게 데이터 변환
       const productsData = response.content || [];
       const transformedProducts = productsData.map(product => ({
         id: product.id,
         name: product.productName,
         thumbnail: product.thumbnailImageUrl,
         price: product.price,
         discountPrice: product.discountPrice,
         stock: product.totalStock,
         updatedAt: product.updatedAt,
         status: product.isDeleted ? 'DELETED' : 'ACTIVE' // isDeleted 필드 기반으로 상태 설정
       }));
       
       setProducts(transformedProducts);
       
       // 페이지네이션 정보 설정
       setTotalPages(response.totalPages || 0);
       setTotalItems(response.totalElements || 0);
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
        page: currentPage - 1, // 백엔드는 0-based pagination (1페이지 클릭 시 0 전달)
        size: 10 // 페이지당 10개 아이템
      };
      
             const response = await sortAdminProducts(params);
       console.log('상품 정렬 응답:', response);
       
       // 백엔드 응답 구조에 맞게 데이터 변환
       const productsData = response.content || [];
       const transformedProducts = productsData.map(product => ({
         id: product.id,
         name: product.productName,
         thumbnail: product.thumbnailImageUrl,
         price: product.price,
         discountPrice: product.discountPrice,
         stock: product.totalStock,
         updatedAt: product.updatedAt,
         status: product.isDeleted ? 'DELETED' : 'ACTIVE' // isDeleted 필드 기반으로 상태 설정
       }));
       
       setProducts(transformedProducts);
       
       // 페이지네이션 정보 설정
       setTotalPages(response.totalPages || 0);
       setTotalItems(response.totalElements || 0);
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
      loadProducts(); // 기본적으로 정렬된 목록을 보여줌
    }
  }, [currentPage, searchTerm, sortKey, sortOrder, statusFilter, forceSearch]);

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





  // 삭제 확인 모달 표시
  const showDeleteConfirm = (id) => {
    setConfirmData({ 
      productId: id, 
      message: '정말 삭제하시겠습니까?' 
    });
    setShowConfirmModal(true);
  };

  // 복구 확인 모달 표시
  const showRestoreConfirm = (id) => {
    setConfirmData({ 
      productId: id, 
      message: '정말 복구하시겠습니까?' 
    });
    setShowConfirmModal(true);
  };

  // 삭제/복구 실행
  const handleDeleteConfirm = async () => {
    const { productId } = confirmData;
    const isRestore = confirmData.message.includes('복구');
    
    try {
      if (isRestore) {
        await restoreAdminProduct(productId);
        setSuccessMessage('상품이 성공적으로 복구되었습니다.');
      } else {
        await deleteAdminProduct(productId);
        setSuccessMessage('상품이 성공적으로 삭제되었습니다.');
      }
      
      setShowSuccessModal(true);
      
      // 현재 상태에 맞게 목록 다시 로드
      if (searchTerm) {
        searchProducts();
      } else {
        loadProducts();
      }
    } catch (error) {
      console.error(isRestore ? '상품 복구 실패:' : '상품 삭제 실패:', error);
      
      let errorMessage = isRestore ? '상품 복구에 실패했습니다.' : '상품 삭제에 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = isRestore ? '복구할 상품을 찾을 수 없습니다.' : '삭제할 상품을 찾을 수 없습니다.';
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
       loadProducts();
     }
   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          message={successMessage}
        />
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleDeleteConfirm}
          title={confirmData.message.includes('복구') ? '복구 확인' : '삭제 확인'}
          message={confirmData.message}
          confirmText={confirmData.message.includes('복구') ? '복구' : '삭제'}
          cancelText="취소"
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">상품 관리</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          <div className="mt-4">
            <Link
              to="/admin/products/create"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>상품 등록</span>
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">검색 및 필터</h2>
            </div>
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
                  onChange={e => handleSortChange(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
                >
                  <option value="updatedAt">등록일순</option>
                  <option value="productName">상품명순</option>
                  <option value="totalStock">재고순</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={e => handleSortOrderChange(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 font-medium"
                >
                  <option value="ALL">상태 전체</option>
                  <option value="ACTIVE">판매중</option>
                  <option value="DELETED">삭제됨</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 목록 카드 + 테이블 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center p-6 pb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">상품 목록</h2>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '720px' }}>
            <table className="min-w-full table-fixed divide-y divide-gray-200/30">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 w-16">순번</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 w-28">썸네일</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 min-w-[240px]">상품명</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-28">상태</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 w-24">총 재고</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-36">상품등록일</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-40">관리</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-20">리뷰</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {products.length > 0 ? (
                  products.map((p, index) => (
                    <tr key={`product-${p.id}-${currentPage}-${index}`} className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-28">
                        <div className="w-12 h-12 overflow-hidden rounded-lg shadow-sm bg-gray-200 flex items-center justify-center">
                          <img
                            src={p.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[240px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center w-28">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'}`}>
                          {p.status === 'ACTIVE' ? '판매중' : '삭제됨'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right w-24">{p.stock || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center w-36">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2 w-40">
                        <Link 
                          to={`/admin/products/detail/${p.id}`} 
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow"
                        >
                          수정
                        </Link>
                        {p.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => showDeleteConfirm(p.id)} 
                            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 hover:text-red-800 font-semibold transition-all duration-200 shadow-sm hover:shadow"
                          >
                            삭제
                          </button>
                        ) : (
                          <button 
                            onClick={() => showRestoreConfirm(p.id)} 
                            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-800 font-semibold transition-all duration-200 shadow-sm hover:shadow"
                          >
                            복구
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center w-20">
                        <Link 
                          to={`/admin/products/${p.id}/reviews`} 
                          className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full transition-colors duration-200"
                          title="리뷰 보기"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">조건에 맞는 상품이 없습니다.</p>
                        <p className="text-gray-400 text-sm mt-1">검색 조건을 변경해 보세요.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalItems > itemsPerPage && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-center">
              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                className="pagination-modern"
              />
            </div>
          </div>
        )}

        {/* 메시지 팝업 */}
        <MessagePopup
          isOpen={showMessagePopup}
          onClose={() => setShowMessagePopup(false)}
          message={messageData.message}
          type={messageData.type}
        />
      </div>
    </div>
  );
};

export default AdminProductListPage;