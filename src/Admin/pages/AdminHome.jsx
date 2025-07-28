const Home = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-6 py-12">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">TalkTrip Admin에 오신 것을 환영합니다!</h2>
      <p className="text-lg text-gray-700 max-w-xl">
        로그인을 진행해주세요!
      </p>
      <button>로그인</button>
    </section>
  );
};

export default Home;
