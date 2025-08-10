import { Outlet } from 'react-router-dom';

const Commerce = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Commerce;
