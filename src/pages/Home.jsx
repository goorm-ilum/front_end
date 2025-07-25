const Home = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-6 py-12">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">TalkTrip에 오신 것을 환영합니다!</h2>
      <p className="text-lg text-gray-700 max-w-xl">
        여행자와 현지인이 소통하는 공간, TalkTrip!<br />
        리뷰/질문 게시판에서 궁금한 점을 나누고, 투어/액티비티에서 다양한 체험을 찾아보세요.<br />
        AI 검색봇이 여러분의 여행을 더욱 편리하게 도와드립니다.
      </p>
      <button>카카오로그인</button>
    </section>
  );
};

export default Home;
