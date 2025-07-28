// src/pages/admin/chats/AdminChatPage.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import ChatRoom from './ChatRoom';

// 더미 채팅방 목록
const dummyRooms = [
  { id: 'room1', title: '고객 A님 문의', lastMessage: '안녕하세요!', updatedAt: '2024-06-10' },
  { id: 'room2', title: '고객 B님 문의', lastMessage: '결제 관련 문의입니다.', updatedAt: '2024-06-09' },
  { id: 'room3', title: '고객 C님 취소 요청', lastMessage: '취소가 되나요?', updatedAt: '2024-06-08' },
];

const AdminChatPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  // 방 삭제 함수 (더미 삭제)
  const handleDeleteRoom = (id) => {
    if (!window.confirm('정말 이 채팅방을 삭제하시겠습니까?')) return;
    // 실제 API 호출 → 목록에서 제거
    console.log('delete room', id);
    // 삭제 후, 다른 방 또는 목록으로 이동
    if (id === roomId) navigate('/admin/chats');
  };

  return (
    <div className="flex h-full">
      {/* 사이드바 */}
      <aside className="w-64 border-r overflow-y-auto">
        <div className="p-4 font-bold">채팅 목록</div>
        <ul>
          {dummyRooms.map((room) => (
            <li
              key={room.id}
              className={`flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer
                ${room.id === roomId ? 'bg-gray-200' : ''}`}
            >
              <Link to={`/admin/chats/${room.id}`} className="flex-1">
                <div className="font-medium">{room.title}</div>
                <div className="text-xs text-gray-500 truncate">{room.lastMessage}</div>
              </Link>
              <button
                onClick={() => handleDeleteRoom(room.id)}
                className="text-red-500 hover:text-red-700 px-2"
                title="채팅방 삭제"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 채팅방 선택 전 / 후 Outlet */}
      <main className="flex-1 p-4">
        <Routes>
          {/* 아무 방도 선택 안됐을 때 */}
          <Route
            index
            element={<div className="text-center text-gray-500">채팅방을 선택하세요.</div>}
          />
          {/* 채팅방이 선택됐을 때 */}
          <Route path=":roomId" element={<ChatRoom />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminChatPage;