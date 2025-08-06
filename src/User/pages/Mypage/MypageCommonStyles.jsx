import React from 'react';

// 마이페이지 공통 스타일 가이드
export const MypageCommonStyles = {
  // 페이지 컨테이너
  pageContainer: "max-w-6xl mx-auto p-6",
  
  // 페이지 헤더
  pageHeader: "mb-6",
  pageTitle: "text-2xl font-bold text-gray-900 mb-2",
  pageSubtitle: "text-gray-600",
  
  // 로딩 상태
  loadingContainer: "text-center py-8",
  loadingSpinner: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600",
  loadingText: "mt-2 text-gray-600",
  
  // 에러 상태
  errorContainer: "text-center py-8",
  errorText: "text-red-600",
  
  // 빈 상태
  emptyContainer: "text-center py-12",
  emptyIcon: "mx-auto h-12 w-12 text-gray-400 mb-4",
  emptyTitle: "text-lg font-medium text-gray-900 mb-2",
  emptySubtitle: "text-gray-500 mb-4",
  emptyButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  
  // 카드 스타일
  card: "border rounded-lg shadow hover:shadow-lg transition flex flex-col relative",
  cardImage: "w-full h-40 object-cover rounded-t-lg bg-gray-100 cursor-pointer",
  cardContent: "p-4 flex-1 flex flex-col justify-between",
  cardTitle: "text-lg font-semibold mb-1 cursor-pointer text-gray-900 hover:text-blue-600",
  cardDescription: "text-gray-600 text-sm mb-2",
  
  // 그리드 레이아웃
  gridContainer: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6",
  
  // 페이지네이션
  paginationContainer: "mt-6"
};

// 마이페이지 공통 컴포넌트들
export const MypageComponents = {
  // 로딩 컴포넌트
  Loading: ({ message = "데이터를 불러오는 중..." }) => (
    <div className={MypageCommonStyles.loadingContainer}>
      <div className={MypageCommonStyles.loadingSpinner}></div>
      <p className={MypageCommonStyles.loadingText}>{message}</p>
    </div>
  ),
  
  // 에러 컴포넌트
  Error: ({ message, onRetry }) => (
    <div className={MypageCommonStyles.errorContainer}>
      <p className={MypageCommonStyles.errorText}>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      )}
    </div>
  ),
  
  // 빈 상태 컴포넌트
  Empty: ({ 
    icon, 
    title, 
    subtitle, 
    buttonText = "둘러보기", 
    onButtonClick 
  }) => (
    <div className={MypageCommonStyles.emptyContainer}>
      <div className={MypageCommonStyles.emptyIcon}>
        {icon}
      </div>
      <h3 className={MypageCommonStyles.emptyTitle}>{title}</h3>
      <p className={MypageCommonStyles.emptySubtitle}>{subtitle}</p>
      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className={MypageCommonStyles.emptyButton}
        >
          {buttonText}
        </button>
      )}
    </div>
  ),
  
  // 페이지 헤더 컴포넌트
  PageHeader: ({ title, subtitle }) => (
    <div className={MypageCommonStyles.pageHeader}>
      <h2 className={MypageCommonStyles.pageTitle}>{title}</h2>
      {subtitle && <p className={MypageCommonStyles.pageSubtitle}>{subtitle}</p>}
    </div>
  )
};

// 마이페이지 공통 아이콘들
export const MypageIcons = {
  // 하트 아이콘 (좋아요)
  Heart: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  
  // 빈 하트 아이콘
  HeartOutline: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  
  // 주문 아이콘
  Order: () => (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  
  // 리뷰 아이콘
  Review: () => (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  
  // 검색 아이콘
  Search: () => (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
};

export default MypageCommonStyles; 