import axios from 'axios';

// 상품 목록 조회
export const getProductList = async (params = {}) => {
  try {
    const response = await axios.get('/api/products', {
      params: {
        page: params.page || 0,
        size: params.size || 9,
        keyword: params.keyword || ''
      }
    });
    return response.data;
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
};

// AI 검색 상품 조회
export const aiSearchProducts = async (query) => {
  try {
    const response = await axios.post('/api/products/aisearch', {
      query: query
    });
    return response.data;
  } catch (error) {
    console.error('AI 검색 실패:', error);
    throw error;
  }
};

// 상품 상세 조회
export const getProductDetail = async (productId) => {
  try {
    const response = await axios.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 상세 조회 실패:', error);
    throw error;
  }
};

// 좋아요 토글 (추가/삭제 통합)
export const toggleLike = async (productId) => {
  try {
    const response = await axios.post(`/api/products/${productId}/like`);
    return response.data;
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    throw error;
  }
};

// 좋아요 목록 조회
export const getLikedProducts = async (params = {}) => {
  try {
    const response = await axios.get('/api/products/liked', {
      params: {
        page: params.page || 0,
        size: params.size || 9
      }
    });
    return response.data;
  } catch (error) {
    console.error('좋아요 목록 조회 실패:', error);
    throw error;
  }
}; 