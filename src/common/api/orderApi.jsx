import axiosInstance from './mainApi';
import { getCookie } from '../util/cookieUtil';

// 관리자 주문 목록 조회
export const getAdminOrders = async () => {
  try {
    const member = getCookie("member");
    
    if (!member || !member.accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const response = await axiosInstance.get('/api/admin/orders/me');
    return response.data;
  } catch (error) {
    console.error('관리자 주문 목록 조회 실패:', error);
    
    if (error.response?.status === 403) {
      console.error('403 Forbidden - 권한이 없습니다. 관리자 권한이 필요합니다.');
      throw new Error('관리자 권한이 필요합니다.');
    }
    
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - 로그인이 필요합니다.');
      throw new Error('로그인이 필요합니다.');
    }
    
    throw error;
  }
};

// 주문 상세 조회
export const getOrderDetail = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('주문 상세 조회 실패:', error);
    throw error;
  }
}; 