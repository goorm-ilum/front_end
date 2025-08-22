import React from 'react';

const ReviewSummary = ({ reviewStats }) => {
  if (!reviewStats) return null;

  const { totalCount, positiveCount, negativeCount, neutralCount, positiveRate, negativeRate, neutralRate } = reviewStats;

  // 퍼센트 값을 반올림 처리
  const roundedPositiveRate = Math.round(positiveRate);
  const roundedNeutralRate = Math.round(neutralRate);
  const roundedNegativeRate = Math.round(negativeRate);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8">
      {/* AI 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 리뷰 분석 결과
          </h3>
          <p className="text-sm text-gray-600">리뷰 내용을 통한 감정 분석 결과입니다.</p>
        </div>
      </div>

      {/* 통합 감정 분포 프로그레스바 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">긍부정 비율</span>
            <span className="text-sm font-semibold text-gray-600">100%</span>
          </div>
          
          {/* 통합 프로그레스바 */}
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            {/* 긍정 리뷰 (초록) */}
            <div 
              className="inline-block h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${roundedPositiveRate}%` }}
            ></div>
            
            {/* 중립 리뷰 (회색) */}
            <div 
              className="inline-block h-full bg-gradient-to-r from-gray-500 to-gray-600 transition-all duration-1000 ease-out"
              style={{ width: `${roundedNeutralRate}%` }}
            ></div>
            
            {/* 부정 리뷰 (빨강) */}
            <div 
              className="inline-block h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000 ease-out"
              style={{ width: `${roundedNegativeRate}%` }}
            ></div>
          </div>
          
          {/* 범례 */}
          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600">긍정 ({roundedPositiveRate}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-600">중립 ({roundedNeutralRate}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-600">부정 ({roundedNegativeRate}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI 분석 설명 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/30">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>AI가 리뷰 내용을 분석하여 감정을 분류한 결과입니다.</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
