import { Link, useLocation } from 'react-router-dom';
import ChatIcon from './ChatIcon';

const Header = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 왼쪽 로고 */}
        <div className="flex items-center min-w-[120px]">
          <Link to="/" className="text-2xl font-extrabold text-blue-600">
            TalkTrip
          </Link>
        </div>

        {/* nav: user / admin 분기 */}
        <nav className="flex-1 flex justify-center gap-8">
          {isAdmin ? (
            <>
              <Link
                to="/admin/"
                className="text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/admin/products"
                className="text-gray-700 hover:text-blue-600"
              >
                상품관리
              </Link>
              <Link
                to="/admin/orders"
                className="text-gray-700 hover:text-blue-600"
              >
                주문관리
              </Link>
              <Link
                to="/admin/chats"
                className="text-gray-700 hover:text-blue-600"
              >
                채팅관리
              </Link>
              <Link
                to="/admin/profile"
                className="text-gray-700 hover:text-blue-600"
              >
                정보수정
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/commerce"
                className="text-gray-700 hover:text-blue-600"
              >
                투어/액티비티
              </Link>
              <Link
                to="/mypage"
                className="text-gray-700 hover:text-blue-600"
              >
                Mypage
              </Link>
              {/* 사용자용 추가 메뉴들... */}
              <ChatIcon />
            </>
          )}
        </nav>

        {/* 오른쪽 로그인 버튼 */}
        <div className="flex items-center gap-2 min-w-[120px] justify-end">
          <Link
            to="/login"
            className="bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;