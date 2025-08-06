import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import MyInfo from '../pages/Mypage/MyInfo';
import MyOrder from '../pages/Mypage/MyOrder';
import MyLike from '../pages/Mypage/MyLike';
import MyReview from '../pages/Mypage/MyReview';

const MypageMenu = () => {
  const [selectedMenu, setSelectedMenu] = useState('info');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // URL 파라미터에서 탭 정보 확인
  useEffect(() => {
    const tab = searchParams.get('tab');
    
    if (tab && ['info', 'order', 'like', 'review'].includes(tab)) {
      setSelectedMenu(tab);
    } else if (location.pathname === '/mypage') {
      // 기본 경로일 때는 내 정보 탭으로 설정
      setSelectedMenu('info');
    }
  }, [searchParams, location.pathname]);

  // 페이지 새로고침 감지 및 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 페이지가 새로고침될 때 실행될 코드
      console.log('마이페이지 새로고침 감지');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const menuItems = [
    { id: 'info', label: '내 정보', component: MyInfo },
    { id: 'order', label: '내 구매내역', component: MyOrder },
    { id: 'like', label: '내 좋아요', component: MyLike },
    { id: 'review', label: '내 리뷰', component: MyReview },
  ];

  // 탭 클릭 핸들러
  const handleTabClick = (tabId) => {
    setSelectedMenu(tabId);
    navigate(`/mypage?tab=${tabId}`);
  };

  const getSelectedComponent = () => {
    return menuItems.find((item) => item.id === selectedMenu)?.component || MyInfo;
  };

  const SelectedComponent = getSelectedComponent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메뉴 바 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedMenu === item.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 메뉴의 컴포넌트 렌더링 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SelectedComponent />
      </div>
    </div>
  );
};

export default MypageMenu;
