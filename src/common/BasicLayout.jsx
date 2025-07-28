import Header from "./Header";
import Footer from "./Footer";
import { Outlet, Link } from "react-router-dom";  

const isFullWidth = true;

const BasicLayout = () => {
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
        </div>
      </div>
    </div>
  );
};

export default BasicLayout;
