import axiosInstance from './mainApi';

// 관리자 상품 목록 조회 (기본)
export const getAdminProducts = async (params = {}) => {
  try {
    console.log('관리자 상품 목록 조회 요청:', params);
    
    const response = await axiosInstance.get('/api/admin/products', {
      params: {
        page: params.page || 0,
        size: 10 // 고정
      }
    });
    
    console.log('관리자 상품 목록 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 목록 조회 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 검색
export const searchAdminProducts = async (params = {}) => {
  try {
    console.log('관리자 상품 검색 요청:', params);
    
    const response = await axiosInstance.get('/api/admin/products/search', {
      params: {
        keyword: params.keyword || '',
        sortBy: params.sortBy || '',
        ascending: params.ascending !== false, // true가 기본값
        page: params.page || 0,
        size: 10 // 고정
      }
    });
    
    console.log('관리자 상품 검색 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 검색 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 정렬
export const sortAdminProducts = async (params = {}) => {
  try {
    console.log('관리자 상품 정렬 요청:', params);
    
    const response = await axiosInstance.get('/api/admin/products/sort', {
      params: {
        sortBy: params.sortBy || '',
        ascending: params.ascending !== false, // true가 기본값
        page: params.page || 0,
        size: 10 // 고정
      }
    });
    
    console.log('관리자 상품 정렬 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 정렬 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 상세 조회
export const getAdminProductDetail = async (productId) => {
  try {
    console.log('관리자 상품 상세 조회 요청:', productId);
    
    const response = await axiosInstance.get(`/api/admin/products/${productId}`);
    
    console.log('관리자 상품 상세 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 상세 조회 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 생성
export const createAdminProduct = async (productData) => {
  try {
    console.log('관리자 상품 생성 요청:', productData);
    
    const response = await axiosInstance.post('/api/admin/products', productData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('관리자 상품 생성 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 생성 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 수정
export const updateAdminProduct = async (productId, productData) => {
  try {
    console.log('관리자 상품 수정 요청:', { productId, productData });
    
    const response = await axiosInstance.put(`/api/admin/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('관리자 상품 수정 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 수정 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
};

// 관리자 상품 삭제
export const deleteAdminProduct = async (productId) => {
  try {
    console.log('관리자 상품 삭제 요청:', productId);
    
    const response = await axiosInstance.delete(`/api/admin/products/${productId}`);
    
    console.log('관리자 상품 삭제 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('관리자 상품 삭제 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
}; 