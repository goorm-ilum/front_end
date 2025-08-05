import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import KakaoLoginButton from "./components/KakaoLoginButton";

const Header = () => {
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, role } = loginState;
  const isLogin = !!accessToken; // accessToken이 있으면 로그인된 것으로 간주
  const isAdmin = location.pathname.startsWith('/admin');
  
  // role 체크를 더 유연하게
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;
  const isAdminUser = isLogin && isAdminRole;

  console.log('=== Header 디버깅 ===');
  console.log('전체 loginSlice 상태:', loginState);
  console.log('location.pathname:', location.pathname);
  console.log('accessToken:', accessToken);
  console.log('isLogin:', isLogin);
  console.log('role:', role);
  console.log('role type:', typeof role);
  console.log('role === "A":', role === 'A');
  console.log('role === A:', role === 'A');
  console.log('role === 1:', role === 1);
  console.log('isAdminRole:', isAdminRole);
  console.log('isAdmin:', isAdmin);
  console.log('isAdminUser:', isAdminUser);
  console.log('isAdmin && isAdminUser:', isAdmin && isAdminUser);
  
  // 조건별 디버깅
  console.log('조건 분석:');
  console.log('- isAdmin (경로가 /admin으로 시작):', isAdmin);
  console.log('- accessToken 존재:', !!accessToken);
  console.log('- isLogin (로그인 상태):', isLogin);
  console.log('- role 값:', role);
  console.log('- isAdminRole (관리자 권한):', isAdminRole);
  console.log('- 최종 조건 (isAdmin && isAdminUser):', isAdmin && isAdminUser);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 왼쪽 로고 */}
        <div className="flex items-center min-w-[120px]">
          <Link 
            to={isAdmin ? "/admin" : "/"} 
            className="text-2xl font-extrabold text-blue-600"
          >
            TalkTrip
          </Link>
        </div>

        {/* nav: user / admin 분기 */}
        <nav className="flex-1 flex justify-center gap-8">
                     {isAdmin ? (
             <>
                               <Link
                  to="/admin"
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
         
            </>
          )}
        </nav>

        {/* 오른쪽 로그인 버튼 */}
        <KakaoLoginButton />
      </div>
    </header>
  );
};

export default Header;