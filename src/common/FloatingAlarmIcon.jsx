import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from './api/mainApi';

const FloatingAlarmIcon = () => {
  const [alarmCount, setAlarmCount] = useState(3);
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken } = loginState;
  const isLogin = !!accessToken;

  // FloatingIcon을 모든 페이지에서 표시

  // 현재 경로에 따라 알림 링크 결정
  const getAlarmLink = () => {
    if (location.pathname.startsWith('/admin')) {
      return '/admin/alarms'; // 관리자 페이지에서는 관리자 알림
    } else {
      return '/alarms'; // 사용자 페이지에서는 일반 알림
    }
  };

  // 현재 경로에 따라 제목 결정
  const getAlarmTitle = () => {
    if (location.pathname.startsWith('/admin')) {
      return '알림 관리'; // 관리자용 제목
    } else {
      return '알림'; // 사용자용 제목
    }
  };

  // 알림 팝업 토글
  const toggleAlarmPopup = () => {
    setShowAlarmPopup(!showAlarmPopup);
  };

  // 안 읽은 알림 개수 가져오기
  const fetchAlarmCount = async () => {
    // 개발 단계에서는 인증 체크를 건너뛰고 API 호출
    // try {
    //   console.log('=== 안 읽은 알림 개수 API 호출 (개발 모드) ===');
    //   const userId = 'dhrdbs'; // 실제로는 로그인한 사용자 ID를 사용해야 함
    //   const response = await axiosInstance.get(`/api/alarm/countUnreadAlarms?userId=${userId}`);
    //   console.log('안 읽은 알림 개수 응답:', response.data);
    //   
    //   if (response.data && response.data.count !== undefined) {
    //     setAlarmCount(response.data.count);
    //     console.log('안 읽은 알림 개수:', response.data.count);
    //   } else {
    //     console.log('응답 데이터에 count가 없어서 기본값 3을 사용합니다.');
    //     setAlarmCount(3);
    //   }
    // } catch (error) {
    //   console.error('안 읽은 알림 개수 가져오기 실패:', error);
    //   console.error('에러 상세:', error.response?.data);
    //   console.error('에러 상태:', error.response?.status);
    //   
    //   // 개발 단계에서는 에러가 발생해도 기본값 사용
    //   console.log('개발 단계: 에러 발생 시에도 기본값 3을 사용합니다.');
    //   setAlarmCount(3);
    // }
    
    // API 호출 비활성화 - 기본값 3 사용
    console.log('=== 알림 API 호출 비활성화됨 ===');
    setAlarmCount(3);
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 안 읽은 알림 개수 가져오기
    fetchAlarmCount();
    
    // 주기적으로 안 읽은 알림 개수 업데이트 (30초마다) - 비활성화
    // const interval = setInterval(fetchAlarmCount, 30000);
    // return () => clearInterval(interval);
  }, []); // 개발 단계에서는 의존성 제거

  // 테스트용 알림 데이터
  const testAlarms = [
    { id: 1, message: '새로운 주문이 들어왔습니다.', time: '2분 전', isRead: false },
    { id: 2, message: '상품 리뷰가 등록되었습니다.', time: '5분 전', isRead: false },
    { id: 3, message: '배송이 완료되었습니다.', time: '10분 전', isRead: false },
    { id: 4, message: '결제가 완료되었습니다.', time: '15분 전', isRead: true },
    { id: 5, message: '상품이 재고에 추가되었습니다.', time: '20분 전', isRead: true },
    { id: 6, message: '쿠폰이 발급되었습니다.', time: '25분 전', isRead: true },
    { id: 7, message: '회원가입이 완료되었습니다.', time: '30분 전', isRead: true },
    { id: 8, message: '비밀번호가 변경되었습니다.', time: '35분 전', isRead: true },
  ];

  // 개발 단계에서는 로그인 상태와 관계없이 알림 아이콘 표시

  return (
    <>
      <div
        onClick={toggleAlarmPopup}
        className="fixed bottom-6 left-6 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 cursor-pointer"
        title={getAlarmTitle()}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405C18.79 14.79 18 13.42 18 12V8c0-3.31-2.69-6-6-6S6 4.69 6 8v4c0 1.42-.79 2.79-1.595 3.595L3 17h5m4 0v1a2 2 0 11-4 0v-1h4z"
          />
        </svg>
        {alarmCount >= 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {alarmCount > 99 ? '99+' : alarmCount}
          </span>
        )}
      </div>

      {/* 알림 팝업 */}
      {showAlarmPopup && (
        <div className="fixed inset-0 z-40" onClick={toggleAlarmPopup}>
          <div className="absolute bottom-20 left-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-yellow-400 text-white px-4 py-3 font-semibold">
              알림 ({alarmCount}개)
            </div>
            <div className="h-80 overflow-y-auto">
              {testAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !alarm.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-1">{alarm.message}</p>
                      <p className="text-xs text-gray-500">{alarm.time}</p>
                    </div>
                    {!alarm.isRead && (
                      <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <Link
                to={getAlarmLink()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                모든 알림 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAlarmIcon; 