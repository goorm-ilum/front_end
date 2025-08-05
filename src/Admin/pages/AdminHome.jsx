import { useSelector } from 'react-redux';

const Home = () => {
  const loginState = useSelector((state) => state.loginSlice);
  const { accessToken, name, role } = loginState;
  const isLogin = !!accessToken;
  const isAdminRole = role === 'A' || role === 'A' || role === 'ADMIN' || role === 'admin' || role === 1;

  return (
    <section className="flex flex-col items-center justify-center text-center gap-6 py-12">
      <h2 className="text-3xl font-bold text-blue-700 mb-8">TalkTrip Admin에 오신 것을 환영합니다!</h2>
      {isLogin && isAdminRole ? (
        <p className="text-lg text-gray-700 max-w-xl mt-4">
          환영합니다, {name} 관리자님!
        </p>
      ) : (
        <p className="text-lg text-gray-700 max-w-xl mt-4">
          로그인을 진행해주세요!
        </p>
      )}
    </section>
  );
};

export default Home;
