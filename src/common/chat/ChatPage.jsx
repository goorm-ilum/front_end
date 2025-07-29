// src/common/chat/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ChatRoom from './ChatRoom';

// 더미 채팅방 목록 (더 많은 데이터 추가)
const dummyRooms = [
  { id: 'room1', title: '고객 A님 문의', lastMessage: '안녕하세요!', updatedAt: '2024-06-10', isRead: false },
  { id: 'room2', title: '고객 B님 문의', lastMessage: '결제 관련 문의입니다.', updatedAt: '2024-06-09', isRead: true },
  { id: 'room3', title: '고객 C님 취소 요청', lastMessage: '취소가 되나요?', updatedAt: '2024-06-08', isRead: false },
  { id: 'room4', title: '고객 D님 투어 문의', lastMessage: '서울 투어 상품에 대해 문의드립니다.', updatedAt: '2024-06-07', isRead: true },
  { id: 'room5', title: '고객 E님 예약 변경', lastMessage: '날짜를 변경하고 싶습니다.', updatedAt: '2024-06-06', isRead: false },
  { id: 'room6', title: '고객 F님 리뷰 문의', lastMessage: '리뷰를 어떻게 작성하나요?', updatedAt: '2024-06-05', isRead: true },
  { id: 'room7', title: '고객 G님 환불 요청', lastMessage: '환불 처리가 안되고 있습니다.', updatedAt: '2024-06-04', isRead: false },
  { id: 'room8', title: '고객 H님 가이드 문의', lastMessage: '가이드 언어는 어떤 것이 있나요?', updatedAt: '2024-06-03', isRead: true },
  { id: 'room9', title: '고객 I님 교통편 문의', lastMessage: '집합 장소까지 어떻게 가나요?', updatedAt: '2024-06-02', isRead: false },
  { id: 'room10', title: '고객 J님 음식 문의', lastMessage: '점심 식사가 포함되나요?', updatedAt: '2024-06-01', isRead: true },
  { id: 'room11', title: '고객 K님 날씨 문의', lastMessage: '비가 오면 어떻게 되나요?', updatedAt: '2024-05-31', isRead: false },
  { id: 'room12', title: '고객 L님 인원 변경', lastMessage: '인원을 추가하고 싶습니다.', updatedAt: '2024-05-30', isRead: true },
  { id: 'room13', title: '고객 M님 할인 문의', lastMessage: '단체 할인이 있나요?', updatedAt: '2024-05-29', isRead: false },
  { id: 'room14', title: '고객 N님 사진 문의', lastMessage: '사진 촬영이 가능한가요?', updatedAt: '2024-05-28', isRead: true },
  { id: 'room15', title: '고객 O님 시간 변경', lastMessage: '출발 시간을 변경하고 싶습니다.', updatedAt: '2024-05-27', isRead: false },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const [rooms, setRooms] = useState(dummyRooms);

  // 현재 경로에 따라 채팅방 링크 결정
  const getChatLink = (roomId) => {
    if (location.pathname.startsWith('/admin')) {
      return `/admin/chats/${roomId}`; // 관리자 페이지에서는 관리자 채팅
    } else {
      return `/chat/${roomId}`; // 사용자 페이지에서는 일반 채팅
    }
  };

  // 읽지 않은 채팅방 개수 계산
  const unreadCount = rooms.filter(room => !room.isRead).length;

  // 채팅방 클릭 시 읽음 처리
  const handleRoomClick = async (roomId) => {
    // 해당 채팅방 찾기
    const room = rooms.find(r => r.id === roomId);
    if (room && !room.isRead) {
      // 즉시 UI 업데이트
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId ? { ...room, isRead: true } : room
        )
      );
      console.log(`채팅방 ${roomId} 읽음 처리 완료`);
    }
  };

  // 방 삭제 함수 (더미 삭제)
  const handleDeleteRoom = (id) => {
    if (!window.confirm('정말 이 채팅방을 삭제하시겠습니까?')) return;
    // 실제 API 호출 → 목록에서 제거
    console.log('delete room', id);
    // 삭제 후, 다른 방 또는 목록으로 이동
    if (id === roomId) {
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/chats');
      } else {
        navigate('/chat');
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* 사이드바 - 스크롤 가능하도록 수정 */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="px-4 py-1 font-bold border-t border-b bg-gray-50 text-gray-900">
          채팅 목록 ({rooms.length})
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-red-600 font-normal">
              (읽지 않음: {unreadCount})
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul>
            {rooms.map((room) => (
              <li
                key={room.id}
                className={`flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                  ${room.id === roomId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  ${!room.isRead ? 'bg-yellow-50 border-l-2 border-l-yellow-400' : ''}`}
              >
                <Link to={getChatLink(room.id)} className="flex-1 min-w-0" onClick={() => handleRoomClick(room.id)}>
                  <div className={`font-medium truncate ${!room.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                    {room.title}
                    {!room.isRead && (
                      <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <div className={`text-xs truncate mt-1 ${!room.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {room.lastMessage}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{room.updatedAt}</div>
                </Link>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="text-blue-400 hover:text-blue-600 px-2 ml-2 flex-shrink-0 transition-colors duration-200"
                  title="채팅방 삭제"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 채팅방 선택 전 / 후 Outlet */}
      <main className="flex-1 p-4 bg-gray-50">
        <Routes>
          {/* 아무 방도 선택 안됐을 때 */}
          <Route
            index
            element={
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-2xl mb-2">💬</div>
                  <div>채팅방을 선택하세요.</div>
                  <div className="text-sm mt-1">총 {rooms.length}개의 채팅방이 있습니다.</div>
                </div>
              </div>
            }
          />
          {/* 채팅방이 선택됐을 때 */}
          <Route path=":roomId" element={<ChatRoom />} />
        </Routes>
      </main>
    </div>
  );
};

export default ChatPage; 