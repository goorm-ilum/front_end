import { Outlet } from 'react-router-dom';

const Commerce = () => {
  return (
    <div className="p-4">
      <Outlet /> {/* 자식 라우트들이 여기 들어옴 */}
    </div>
  );
};

export default Commerce;
