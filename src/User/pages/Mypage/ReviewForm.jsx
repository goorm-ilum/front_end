import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 별점 선택 컴포넌트
const StarRatingInput = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-2xl transition-colors duration-200"
        >
          <svg
            className={`w-8 h-8 ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {hoverRating || rating}점
      </span>
    </div>
  );
};

const ReviewForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 모드와 리뷰 ID 확인
  const mode = searchParams.get('mode'); // 'create' 또는 'edit'
  const reviewId = searchParams.get('reviewId');
  const productId = searchParams.get('productId');
  
  const [formData, setFormData] = useState({
    rating: 5,
    content: ''
  });
  
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 수정 모드일 때 기존 리뷰 데이터 로드
  useEffect(() => {
    if (mode === 'edit' && reviewId) {
      loadReviewData();
    }
    
    if (productId) {
      loadProductInfo();
    }
  }, [mode, reviewId, productId]);

  // 기존 리뷰 데이터 로드 (수정 모드)
  const loadReviewData = async () => {
    try {
      setIsLoading(true);
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/reviews/${reviewId}`);
      // const reviewData = await response.json();
      
      // 임시 데이터
      const reviewData = {
        id: reviewId,
        rating: 4,
        content: '기존 리뷰 내용입니다.'
      };
      
      setFormData({
        rating: reviewData.rating,
        content: reviewData.content
      });
    } catch (error) {
      console.error('리뷰 데이터 로드 실패:', error);
      setErrors({ general: '리뷰 데이터를 불러오는데 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 상품 정보 로드
  const loadProductInfo = async () => {
    try {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/products/${productId}`);
      // const productData = await response.json();
      
      // 임시 데이터
      const productData = {
        id: productId,
        title: '오사카 3박 4일 자유여행 패키지',
        thumbnail: 'https://placehold.co/200x150?text=상품이미지',
        price: 820000
      };
      
      setProductInfo(productData);
    } catch (error) {
      console.error('상품 정보 로드 실패:', error);
    }
  };

  // 별점 변경 핸들러
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  // 내용 변경 핸들러
  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating) {
      newErrors.rating = '별점을 선택해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '리뷰 내용을 입력해주세요.';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = '리뷰 내용은 최소 10자 이상 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formDataToSend = {
        rating: formData.rating,
        content: formData.content,
        productId: productId
      };
      
      let url = '/api/reviews';
      let method = 'POST';
      
      if (mode === 'edit' && reviewId) {
        url = `/api/reviews/${reviewId}`;
        method = 'PUT';
      }
      
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(url, {
      //   method,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formDataToSend)
      // });
      
      // if (!response.ok) {
      //   throw new Error('리뷰 저장에 실패했습니다.');
      // }
      
      console.log('리뷰 저장 성공:', formData);
      
      // 성공 후 마이페이지 리뷰 목록으로 이동
      navigate('/mypage?tab=review');
      
    } catch (error) {
      console.error('리뷰 저장 실패:', error);
      setErrors({ general: '리뷰 저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (mode === 'edit') {
      navigate('/mypage?tab=review');
    } else {
      navigate('/mypage?tab=order');
    }
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">리뷰 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'edit' ? '리뷰 수정' : '리뷰 작성'}
        </h1>
        <p className="text-gray-600">
          {mode === 'edit' ? '리뷰를 수정해주세요.' : '상품에 대한 솔직한 리뷰를 작성해주세요.'}
        </p>
      </div>

      {/* 상품 정보 */}
      {productInfo && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">상품 정보</h2>
          <div className="flex gap-4">
            <img
              src={productInfo.thumbnail}
              alt={productInfo.title}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{productInfo.title}</h3>
              <p className="text-gray-600">{productInfo.price?.toLocaleString()}원</p>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {errors.general}
          </div>
        )}

        {/* 별점 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            별점 <span className="text-red-500">*</span>
          </label>
          <StarRatingInput
            rating={formData.rating}
            onRatingChange={handleRatingChange}
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-3">
            리뷰 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={handleContentChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요. (최소 10자 이상)"
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>{formData.content.length}/1000자</span>
            {errors.content && (
              <span className="text-red-600">{errors.content}</span>
            )}
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : (mode === 'edit' ? '수정 완료' : '리뷰 작성 완료')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 