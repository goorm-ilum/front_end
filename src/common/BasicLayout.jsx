import Header from './Header';
import Footer from './Footer';
import AIAssistant from './AIAssistant';
import { Outlet } from 'react-router-dom';

const BasicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <Outlet />
        </div>
      </main>
      <AIAssistant />
      <Footer />      
    </div>
  );
};

export default BasicLayout;
