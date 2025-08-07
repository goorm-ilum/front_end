import { useState, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '../util/jwtUtil';

const useMyOrderPagination = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const ITEMS_PER_PAGE = 5;

  // 주문 내역 조회 (기존 로직 유지)
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders/me', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error('주문 내역 조회에 실패했습니다.');
      }

      const data = await response.json();
      
      // 배열 형태의 날짜를 Date 객체로 변환하는 함수
      const parseDateFromArray = (dateArray) => {
        if (Array.isArray(dateArray)) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
          return new Date(year, month - 1, day, hour, minute, second);
        }
        return new Date(dateArray);
      };

      // 최신순으로 정렬 (createdAt 기준 내림차순)
      const sortedOrders = data.sort((a, b) => {
        const dateA = parseDateFromArray(a.createdAt);
        const dateB = parseDateFromArray(b.createdAt);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        
        return dateB.getTime() - dateA.getTime(); // 최신순 (내림차순)
      });
      
      setOrders(sortedOrders);
      setTotalItems(sortedOrders.length);
      setCurrentPage(1); // 데이터 로드 시 첫 페이지로
      
    } catch (err) {
      console.error('주문 내역 조회 오류:', err);
      setError(err.message);
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 변경
  const changePage = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // 현재 페이지의 주문들 계산
  const getCurrentPageOrders = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return {
    orders: getCurrentPageOrders(),
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    changePage,
    loadOrders
  };
};

export default useMyOrderPagination; 