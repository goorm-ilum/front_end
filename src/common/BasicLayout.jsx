import Header from './Header';
import Footer from './Footer';
import FloatingChatIcon from './FloatingChatIcon';
import FloatingAlarmIcon from './FloatingAlarmIcon';
import { Outlet, Link, useLocation } from "react-router-dom"; 

const isFullWidth = true;

const BasicLayout = () => {
  const location = useLocation();
  
  // FloatingChatIcon을 숨길 경로 패턴들
  const hideChatIconPatterns = [
    /^\/commerce\/\d+\/before-payment$/,
    /^\/commerce\/\d+\/payment$/
  ];
  
  const shouldShowChatIcon = !hideChatIconPatterns.some(pattern => 
    pattern.test(location.pathname)
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* Header */}
      <div className="px-4">
        <div className="w-[1200px] mx-auto">
          <Header />
        </div>
      </div>

      {/* Main */}
      <main className="px-4 py-8">
        <div className="w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <div className="px-4">
        <div className="w-[1200px] mx-auto">
          <Footer />
          {shouldShowChatIcon && <FloatingChatIcon />}
          {shouldShowChatIcon && <FloatingAlarmIcon />}
        </div>
      </div>

    </div>
  );
};

export default BasicLayout;
