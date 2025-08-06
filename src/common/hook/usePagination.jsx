import { useState, useCallback, useEffect } from 'react';

const usePagination = (apiCall, initialFilters) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(filters);
      
      // 백엔드 응답 구조에 따라 데이터 처리
      if (response.content) {
        // 페이지네이션 응답 구조
        setData(response.content);
        setTotalItems(response.totalElements || 0);
      } else if (Array.isArray(response)) {
        // 배열 형태 응답
        setData(response);
        setTotalItems(response.length);
      } else {
        // 단일 객체 응답
        setData([response]);
        setTotalItems(1);
      }
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [filters, apiCall]);

  // 필터 변경 시 페이지 1로 리셋
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // 페이지 변경
  const changePage = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  // 필터 변경 시 자동으로 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    totalItems,
    filters,
    loadData,
    updateFilters,
    changePage
  };
};

export default usePagination; 