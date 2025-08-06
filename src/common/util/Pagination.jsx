import React, { useState, useMemo } from 'react';

const Pagination = ({ 
  totalItems, // 전체 아이템 개수
  itemsPerPage, // 페이지당 아이템 개수
  currentPage, 
  onPageChange,
  onPageItemsChange, // 현재 페이지의 아이템들을 부모에게 전달하는 콜백
  showPageNumbers = true,
  showPrevNext = true,
  className = ""
}) => {
  // 페이지네이션 로직
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 현재 페이지의 시작/끝 인덱스 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // 부모 컴포넌트에게 현재 페이지 인덱스 전달
  React.useEffect(() => {
    if (onPageItemsChange) {
      onPageItemsChange({ startIndex, endIndex });
    }
  }, [startIndex, endIndex, onPageItemsChange]);

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 10;
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 maxVisible개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 앞뒤 2개씩 표시
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      // 시작 부분 조정
      if (end - start < 4) {
        if (currentPage <= 3) {
          end = Math.min(totalPages, 5);
        } else {
          start = Math.max(1, totalPages - 4);
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지가 없으면 렌더링하지 않음
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      {/* 이전 버튼 */}
      {showPrevNext && (
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
      )}
      
      {/* 페이지 번호들 */}
      {showPageNumbers && pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-2 border rounded-lg transition-colors ${
            currentPage === pageNum 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      ))}
      
      {/* 다음 버튼 */}
      {showPrevNext && (
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          다음
        </button>
      )}
    </div>
  );
};

export default Pagination; 