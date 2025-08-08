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
    } else {
      // 탭 파라미터가 없거나 유효하지 않은 경우 내 정보 탭으로 설정
      setSelectedMenu('info');
      // URL도 업데이트 (navigate를 의존성에서 제거하여 무한 루프 방지)
      if (location.pathname === '/mypage') {
        navigate('/mypage?tab=info', { replace: true });
      }
    }
  }, [searchParams, location.pathname]);



  const menuItems = [
    { id: 'info', label: '내 정보', component: MyInfo },
    { id: 'order', label: '내 구매내역', component: MyOrder },
    { id: 'like', label: '내 좋아요', component: MyLike },
    { id: 'review', label: '내 리뷰', component: MyReview },
  ];

  // 탭 클릭 핸들러
  const handleTabClick = (tabId) => {
    // 현재 선택된 탭을 다시 클릭한 경우 강제 새로고침
    if (selectedMenu === tabId) {
      // 컴포넌트 재마운트를 위해 잠시 다른 탭으로 이동 후 돌아오기
      setSelectedMenu('');
      setTimeout(() => {
        setSelectedMenu(tabId);
        navigate(`/mypage?tab=${tabId}`, { replace: false });
      }, 10);
    } else {
      setSelectedMenu(tabId);
      navigate(`/mypage?tab=${tabId}`);
    }
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
