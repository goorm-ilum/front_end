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
    const response = await axios.get('/api/me/likes', {
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

// 내 리뷰 목록 조회
export const getMyReviews = async (params = {}) => {
  try {
    const response = await axios.get('/api/me/reviews', {
      params: {
        page: params.page || 0,
        size: params.size || 9
      }
    });
    return response.data;
  } catch (error) {
    console.error('내 리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axios.patch(`/api/reviews/${reviewId}`, {
      comment: reviewData.comment,
      reviewStar: reviewData.reviewStar
    });
    return response.data;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};

// 리뷰 작성 폼 데이터 조회 (상품 정보 포함)
export const getReviewFormData = async (productId) => {
  try {
    const response = await axios.get(`/api/products/${productId}/reviews/form`);
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 폼 데이터 조회 실패:', error);
    throw error;
  }
};

// 리뷰 수정 폼 데이터 조회 (상품 정보 포함)
export const getReviewEditFormData = async (reviewId) => {
  try {
    const response = await axios.get(`/api/reviews/${reviewId}/form`);
    return response.data;
  } catch (error) {
    console.error('리뷰 수정 폼 데이터 조회 실패:', error);
    throw error;
  }
};

// 리뷰 작성
export const createReview = async (productId, reviewData) => {
  try {
    console.log('리뷰 작성 요청:', { productId, reviewData });
    
    // API 문서에 맞는 요청 형식으로 데이터 준비
    const requestData = {
      comment: reviewData.comment,
      reviewStar: parseInt(reviewData.reviewStar) // 숫자로 확실히 변환
    };
    
    console.log('전송할 데이터:', requestData);
    
    const response = await axios.post(`/api/products/${productId}/reviews`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('리뷰 작성 응답:', response);
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    console.error('에러 응답:', error.response);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    throw error;
  }
}; 