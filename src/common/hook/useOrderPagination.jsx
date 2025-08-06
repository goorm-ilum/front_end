import { useCallback } from 'react';
import usePagination from './usePagination';
import { getAdminOrders } from '../api/orderApi';

const useOrderPagination = () => {
  // 초기 필터 설정
  const initialFilters = {
    page: 1,
    size: 15,
    sort: 'date', // date, amount, id
    paymentMethod: '',
    keyword: '',
    orderStatus: ''
  };

  // API 호출 함수 래핑
  const apiCall = useCallback(async (filters) => {
    // 백엔드 API 호출 시 파라미터 변환
    const params = {
      page: filters.page - 1, // 백엔드는 0-based 페이지네이션
      size: filters.size,
      sort: filters.sort,
      paymentMethod: filters.paymentMethod || undefined,
      keyword: filters.keyword || undefined,
      orderStatus: filters.orderStatus || undefined
    };

    // undefined 값 제거
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    return await getAdminOrders(params);
  }, []);

  const pagination = usePagination(apiCall, initialFilters);

  // 주문 전용 헬퍼 함수들
  const updateSort = useCallback((sortKey) => {
    pagination.updateFilters({ sort: sortKey });
  }, [pagination]);

  const updatePaymentFilter = useCallback((paymentMethod) => {
    pagination.updateFilters({ paymentMethod });
  }, [pagination]);

  const updateKeyword = useCallback((keyword) => {
    pagination.updateFilters({ keyword });
  }, [pagination]);

  const updateOrderStatus = useCallback((orderStatus) => {
    pagination.updateFilters({ orderStatus });
  }, [pagination]);

  const updatePageSize = useCallback((size) => {
    // 현재 필터 상태를 유지하면서 size만 변경
    pagination.updateFilters({ 
      size: Number(size),
      // 기존 필터들도 함께 전달하여 유지
      paymentMethod: pagination.filters.paymentMethod,
      keyword: pagination.filters.keyword,
      orderStatus: pagination.filters.orderStatus,
      sort: pagination.filters.sort
    });
  }, [pagination]);

  const resetFilters = useCallback(() => {
    pagination.updateFilters({
      sort: 'date',
      paymentMethod: '',
      keyword: '',
      orderStatus: ''
    });
  }, [pagination]);

  return {
    ...pagination,
    updateSort,
    updatePaymentFilter,
    updateKeyword,
    updateOrderStatus,
    updatePageSize,
    resetFilters
  };
};

export default useOrderPagination; 