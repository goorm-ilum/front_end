import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateReview, getReviewFormData, getReviewEditFormData, createReview } from '../../../common/api/productApi';
import MessagePopup from '../../../common/components/MessagePopup';

const ReviewForm = ({ productId: propsProductId, reviewId: propsReviewId }) => {
  console.log('ReviewForm 컴포넌트 렌더링됨');
  const navigate = useNavigate();
  const { reviewId: urlReviewId, productId: urlProductId } = useParams();
  
  // props 또는 URL 파라미터에서 값 가져오기
  const finalProductId = propsProductId || urlProductId;
  const finalReviewId = propsReviewId || urlReviewId;
  
  console.log('ReviewForm 파라미터:', { propsProductId, propsReviewId, urlReviewId, urlProductId, finalProductId, finalReviewId });
  
  // 상태 관리
  const [formData, setFormData] = useState({
    comment: '',
    reviewStar: 5
  });
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', type: 'info' });

  // 수정 모드인지 확인하고 데이터 로드
  useEffect(() => {
    const loadFormData = async () => {
      console.log('ReviewForm 로드 시작:', { finalReviewId, finalProductId, isEditing });
      setLoading(true);
      setError('');
      
      try {
        if (finalReviewId) {
          // 리뷰 수정 모드
          console.log('리뷰 수정 모드로 설정');
          setIsEditing(true);
          const response = await getReviewEditFormData(finalReviewId);
          
          console.log('리뷰 수정 폼 데이터 응답:', response);
          
          // 백엔드 응답 구조에 맞게 데이터 설정
          if (response && response.productName) {
            setProductInfo({
              productName: response.productName,
              thumbnailImageUrl: response.thumbnailUrl || response.thumbnailImageUrl
            });
            setFormData({
              comment: response.myComment || response.comment || '',
              reviewStar: response.myStar || response.reviewStar || 5
            });
          } else {
            throw new Error('리뷰 수정 데이터를 불러올 수 없습니다.');
          }
        } else if (finalProductId) {
          // 리뷰 작성 모드
          setIsEditing(false);
          const response = await getReviewFormData(finalProductId);
          setProductInfo(response);
        } else {
          // reviewId와 productId 모두 없는 경우 에러 처리
          const errorMessage = '리뷰 또는 상품 정보를 찾을 수 없습니다.';
          alert(errorMessage);
          // 구매내역 페이지로 이동
          navigate('/mypage?tab=order');
          return;
        }
      } catch (error) {
        console.error('폼 데이터 로드 실패:', error);
        
        let errorMessage = '폼 데이터를 불러오는데 실패했습니다.';
        let shouldNavigate = false;
        let status = null;
        
        if (error.response) {
          status = error.response.status;
          if (status === 401) {
            errorMessage = '로그인이 필요합니다.';
            shouldNavigate = true;
          } else if (status === 403) {
            errorMessage = '이미 작성한 리뷰입니다.';
            setErrorMessage(errorMessage);
            setShowErrorPopup(true);
            return;
          } else if (status === 404) {
            if (isEditing) {
              errorMessage = '수정하려는 리뷰를 찾을 수 없습니다.';
            } else {
              errorMessage = '상품을 찾을 수 없습니다.';
            }
            shouldNavigate = true;
          } else {
            errorMessage = `서버 오류: ${status}`;
            shouldNavigate = true;
          }
        } else if (error.request) {
          errorMessage = '서버에 연결할 수 없습니다.';
          shouldNavigate = true;
        } else {
          // 네트워크 오류가 아닌 다른 오류 (예: 데이터 파싱 오류)
          errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
          shouldNavigate = true;
        }
        
        if (status !== 403) {
          setMessageData({ message: errorMessage, type: 'error' });
          setShowMessagePopup(true);
          
          // 오류 발생 시 구매내역 페이지로 이동
          if (shouldNavigate) {
            navigate('/mypage?tab=order');
          }
        }
        return;
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [finalReviewId, finalProductId, navigate]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reviewStar' ? parseInt(value) : value
    }));
  };

  // 별점 변경 핸들러
  const handleStarChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      reviewStar: parseInt(rating)
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('폼 제출 시작:', { isEditing, finalReviewId, finalProductId, formData });
    
    if (!formData.comment.trim()) {
      const errorMessage = '리뷰 내용을 입력해주세요.';
      setMessageData({ message: errorMessage, type: 'warning' });
      setShowMessagePopup(true);
      return;
    }

    // 데이터 검증
    if (isEditing && !finalReviewId) {
      console.log('리뷰 수정 모드에서 reviewId 없음');
      setMessageData({ message: '리뷰 정보를 찾을 수 없습니다.', type: 'error' });
      setShowMessagePopup(true);
      return;
    }
    
    if (!isEditing && !finalProductId) {
      console.log('리뷰 작성 모드에서 productId 없음');
      setMessageData({ message: '상품 정보를 찾을 수 없습니다.', type: 'error' });
      setShowMessagePopup(true);
      return;
    }

    if (!formData.reviewStar || formData.reviewStar < 1 || formData.reviewStar > 5) {
      setMessageData({ message: '별점을 1-5 사이로 선택해주세요.', type: 'warning' });
      setShowMessagePopup(true);
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // 리뷰 수정
        console.log('리뷰 수정 시작:', { 
          reviewId: finalReviewId, 
          formData: {
            comment: formData.comment,
            reviewStar: formData.reviewStar
          }
        });
        
        await updateReview(finalReviewId, formData);
        console.log('리뷰 수정 완료');
      } else {
        // 리뷰 작성
        console.log('리뷰 작성 시작:', { 
          productId: finalProductId, 
          formData: {
            comment: formData.comment,
            reviewStar: formData.reviewStar
          }
        });
        
        // API 문서에 맞는 형식으로 데이터 준비
        const reviewData = {
          comment: formData.comment.trim(),
          reviewStar: parseInt(formData.reviewStar)
        };
        
        console.log('전송할 리뷰 데이터:', reviewData);
        const result = await createReview(finalProductId, reviewData);
        console.log('리뷰 작성 결과:', result);
      }
      
      // 성공 후 내 리뷰 목록으로 이동
      console.log('리뷰 목록 페이지로 이동');
      navigate('/mypage?tab=review');
      
    } catch (error) {
      console.error('리뷰 처리 실패:', error);
      console.error('에러 상세 정보:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 실제 에러인지 확인 (성공적인 응답이지만 에러로 처리되는 경우 방지)
      if (error.response && error.response.status >= 200 && error.response.status < 300) {
        // 성공적인 응답인 경우 리뷰 목록으로 이동
        console.log('성공적인 응답으로 처리됨');
        navigate('/mypage?tab=review');
        return;
      }
      
      let errorMessage = isEditing ? '리뷰 수정 중 오류가 발생했습니다.' : '리뷰 작성 중 오류가 발생했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 403) {
          errorMessage = '이미 작성한 리뷰입니다.';
          setErrorMessage(errorMessage);
          setShowErrorPopup(true);
          return;
        } else if (status === 404) {
          if (isEditing) {
            errorMessage = '수정하려는 리뷰를 찾을 수 없습니다. 리뷰가 삭제되었거나 존재하지 않습니다.';
          } else {
            errorMessage = '상품을 찾을 수 없습니다. 상품이 삭제되었거나 존재하지 않습니다.';
          }
        } else if (status === 500) {
          errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      } else {
        // 네트워크 오류가 아닌 다른 오류 (예: 데이터 파싱 오류)
        errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
      }
      
      if (error.response && error.response.status !== 403) {
        setMessageData({ message: errorMessage, type: 'error' });
        setShowMessagePopup(true);
      }
      // 403 오류는 팝업으로 처리되므로 여기서는 이동하지 않음
    } finally {
      setLoading(false);
    }
  };

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
    // 팝업 닫기 후 구매내역 페이지로 이동
    navigate('/mypage?tab=order');
  };

  // 별점 표시 컴포넌트
  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${!readonly ? 'hover:text-yellow-300' : ''}`}
            disabled={readonly}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  // 로딩 상태
  if (loading && !productInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing ? '리뷰 수정' : '리뷰 작성'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? '리뷰를 수정해주세요.' : '상품에 대한 리뷰를 작성해주세요.'}
        </p>
      </div>

      {/* 상품 정보 표시 */}
      {productInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {productInfo.thumbnailImageUrl ? (
              <img
                src={productInfo.thumbnailImageUrl}
                alt={productInfo.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{productInfo.productName}</h3>
              {productInfo.price && (
                <p className="text-sm text-gray-600">
                  {productInfo.price.toLocaleString()}원
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 별점 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            별점
          </label>
          <StarRating 
            rating={formData.reviewStar} 
            onRatingChange={handleStarChange}
          />
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            리뷰 내용
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
            required
          />
        </div>



        {/* 버튼 그룹 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/mypage?tab=review')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '처리 중...' : (isEditing ? '수정 완료' : '리뷰 작성')}
          </button>
        </div>
      </form>

      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showErrorPopup}
        onClose={handleClosePopup}
        message={errorMessage}
        type="warning"
      />
      
      {/* 일반 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messageData.message}
        type={messageData.type}
      />
    </div>
  );
};

export default ReviewForm; 