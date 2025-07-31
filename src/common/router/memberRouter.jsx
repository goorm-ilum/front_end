import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Loading = () => <div>Loading...</div>;
const KakaoCallback = lazy(() => import('../components/KakaoCallback'));

const MemberRouter = () => {
  return (
    <Routes>
      <Route
        path="kakao"
        element={
          <Suspense fallback={<Loading />}>
            <KakaoCallback />
          </Suspense>
        }
      />
      {/* 다른 회원 관련 경로 추가 가능 */}
    </Routes>
  );
};

export default MemberRouter;
