import Header from './Header';
import Footer from './Footer';
import FloatingChatIcon from './FloatingChatIcon';
import { Outlet } from 'react-router-dom';

// 이 값을 true로 하면 전체 폭, false로 하면 고정 폭(1200px)
const isFullWidth = true;

const BasicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className={isFullWidth ? "w-full min-h-[400px] flex flex-col justify-center" : "w-full max-w-[1200px] mx-auto min-h-[600px] flex flex-col justify-center"}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <FloatingChatIcon />
    </div>
  );
};

export default BasicLayout;
