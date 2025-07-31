import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MyInfo from '../pages/Mypage/MyInfo';
import MyOrder from '../pages/Mypage/MyOrder';
import MyLike from '../pages/Mypage/MyLike';
import MyReview from '../pages/Mypage/MyReview';
import ReviewForm from '../pages/Mypage/ReviewForm';

const MypageMenu = () => {
  const [selectedMenu, setSelectedMenu] = useState('info');
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 탭 정보 확인
  useEffect(() => {
    const tab = searchParams.get('tab');
    const mode = searchParams.get('mode');

    if (mode === 'create' || mode === 'edit') {
      setSelectedMenu('review-form');
    } else if (tab && ['info', 'order', 'like', 'review'].includes(tab)) {
      setSelectedMenu(tab);
    }
  }, [searchParams]);

  const menuItems = [
    { id: 'info', label: '내 정보', component: MyInfo },
    { id: 'order', label: '내 구매내역', component: MyOrder },
    { id: 'like', label: '내 좋아요', component: MyLike },
    { id: 'review', label: '내 리뷰', component: MyReview },
  ];

  const getSelectedComponent = () => {
    if (selectedMenu === 'review-form') {
      return ReviewForm;
    }
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
                onClick={() => setSelectedMenu(item.id)}
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
