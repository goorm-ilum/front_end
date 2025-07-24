import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* 왼쪽 */}
            <div className="flex items-center min-w-[120px]">
            <Link to="/" className="text-2xl font-extrabold text-blue-600">TalkTrip</Link>
            </div>

            {/* 가운데 */}
            <nav className="flex-1 flex justify-center gap-8">
            <Link to="/community" className="text-gray-700 hover:text-blue-600">리뷰/질문</Link>
            <Link to="/commerce" className="text-gray-700 hover:text-blue-600">투어/액티비티</Link>
            </nav>

            {/* 오른쪽 */}
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <Link to="/login" className="bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition-colors">로그인</Link>
            </div>
        </div>
    </header>
  );
};

export default Header;
