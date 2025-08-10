import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import MyInfo from '../pages/Mypage/MyInfo';
import MyOrder from '../pages/Mypage/MyOrder';
import MyLike from '../pages/Mypage/MyLike';
import MyReview from '../pages/Mypage/MyReview';

const MypageMenu = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 탭 정보를 바로 가져와서 초기값 설정
  const initialTab = searchParams.get('tab');
  const [selectedMenu, setSelectedMenu] = useState(() => {
    if (initialTab && ['info', 'order', 'like', 'review'].includes(initialTab)) {
      return initialTab;
    }
    return 'info';
  });
  
  const [refreshKey, setRefreshKey] = useState(0); // 새로고침을 위한 key

  // 새로고침 신호 감지 (location.state에서 forceRefresh 확인) - 먼저 실행
  useEffect(() => {
    if (location.state?.forceRefresh) {
      // 현재 탭 컴포넌트를 재마운트하기 위해 key 변경
      setRefreshKey(prev => prev + 1);
      
      // state 초기화 (중복 실행 방지)
      navigate(location.pathname + location.search, { 
        replace: true, 
        state: undefined 
      });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  // URL 파라미터 변경 시 탭 정보 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    
    if (tab && ['info', 'order', 'like', 'review'].includes(tab)) {
      setSelectedMenu(tab);
    } else if (!tab) {
      // 탭 파라미터가 없는 경우 내 정보 탭으로 설정
      setSelectedMenu('info');
      // URL도 업데이트 (replace: true로 하여 히스토리에 추가되지 않도록)
      if (location.pathname === '/mypage') {
        navigate('/mypage?tab=info', { replace: true });
      }
    }
  }, [searchParams, location.pathname, navigate]);


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

      {/* 선택된 메뉴의 컴포넌트 렌더링 - key prop으로 재마운트 제어 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SelectedComponent key={`${selectedMenu}-${refreshKey}`} />
      </div>
    </div>
  );
};

export default MypageMenu;
