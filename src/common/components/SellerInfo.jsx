import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/mainApi';

const SellerInfo = ({ seller }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  
  // 기본 판매자 정보 (더미 데이터)
  const defaultSeller = {
    id: 1,
    memberId: 'JTRweb',
    businessNumber: '123-45-67890',
    phone: '02-1234-5678',
    email: 'info@talktrip.com'
  };

  const sellerData = seller || defaultSeller;

  // 채팅방 입장 또는 생성 함수
  const handleChatWithSeller = async () => {
    try {
      console.log('판매자와 채팅 시작...', { sellerId: sellerData.memberId });
      
      const response = await axiosInstance.post('/api/chat/rooms/enter', {
        sellerId: sellerData.memberId
      });
      
      console.log('채팅방 응답:', response.data);
      
      // 채팅방으로 이동
      if (response.data.roomId) {
        navigate(`/chat/${response.data.roomId}`);
      }
      
    } catch (error) {
      console.error('채팅방 생성/입장 실패:', error);
      
      let errorMessage = '채팅방 연결에 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = '판매자를 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">판매자 정보</h3>
      
      <div className="flex items-center justify-between">
        {/* 판매자 기본 정보 */}
        <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="relative">
            <div 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              Member ID: {sellerData.memberId}
            </div>
            
            {/* 툴팁 */}
            {showTooltip && (
              <div className="absolute z-10 mt-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{sellerData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{sellerData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>사업자등록번호: {sellerData.businessNumber}</span>
                  </div>
                </div>
                {/* 툴팁 화살표 */}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        {/* 채팅 버튼 */}
        <button 
          onClick={handleChatWithSeller}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          판매자와 채팅
        </button>
      </div>
    </div>
  );
};

export default SellerInfo; 