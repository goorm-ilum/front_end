// src/common/chat/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/mainApi';  // mainApi의 axiosInstance 사용
import ChatRoom from './ChatRoom';

// 더미 채팅방 목록 (더 많은 데이터 추가)
const dummyRooms = [
  { id: 'room1', title: '고객 A님 문의', lastMessage: '안녕하세요!', updatedAt: '2024-06-10', notReadMessageCount: 2 },
  { id: 'room2', title: '고객 B님 문의', lastMessage: '결제 관련 문의입니다.', updatedAt: '2024-06-09', notReadMessageCount: 0 },
  { id: 'room3', title: '고객 C님 취소 요청', lastMessage: '취소가 되나요?', updatedAt: '2024-06-08', notReadMessageCount: 1 },
  { id: 'room4', title: '고객 D님 투어 문의', lastMessage: '서울 투어 상품에 대해 문의드립니다.', updatedAt: '2024-06-07', notReadMessageCount: 0 },
  { id: 'room5', title: '고객 E님 예약 변경', lastMessage: '날짜를 변경하고 싶습니다.', updatedAt: '2024-06-06', notReadMessageCount: 3 },
  { id: 'room6', title: '고객 F님 리뷰 문의', lastMessage: '리뷰를 어떻게 작성하나요?', updatedAt: '2024-06-05', notReadMessageCount: 0 },
  { id: 'room7', title: '고객 G님 환불 요청', lastMessage: '환불 처리가 안되고 있습니다.', updatedAt: '2024-06-04', notReadMessageCount: 1 },
  { id: 'room8', title: '고객 H님 가이드 문의', lastMessage: '가이드 언어는 어떤 것이 있나요?', updatedAt: '2024-06-03', notReadMessageCount: 0 },
  { id: 'room9', title: '고객 I님 교통편 문의', lastMessage: '집합 장소까지 어떻게 가나요?', updatedAt: '2024-06-02', notReadMessageCount: 2 },
  { id: 'room10', title: '고객 J님 음식 문의', lastMessage: '점심 식사가 포함되나요?', updatedAt: '2024-06-01', notReadMessageCount: 0 },
  { id: 'room11', title: '고객 K님 날씨 문의', lastMessage: '비가 오면 어떻게 되나요?', updatedAt: '2024-05-31', notReadMessageCount: 1 },
  { id: 'room12', title: '고객 L님 인원 변경', lastMessage: '인원을 추가하고 싶습니다.', updatedAt: '2024-05-30', notReadMessageCount: 0 },
  { id: 'room13', title: '고객 M님 할인 문의', lastMessage: '단체 할인이 있나요?', updatedAt: '2024-05-29', notReadMessageCount: 4 },
  { id: 'room14', title: '고객 N님 사진 문의', lastMessage: '사진 촬영이 가능한가요?', updatedAt: '2024-05-28', notReadMessageCount: 0 },
  { id: 'room15', title: '고객 O님 시간 변경', lastMessage: '출발 시간을 변경하고 싶습니다.', updatedAt: '2024-05-27', notReadMessageCount: 1 },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const [rooms, setRooms] = useState(dummyRooms);

  // API에서 채팅방 목록 가져오기
  useEffect(() => {
    const fetchChatRooms = async () => {
      console.log('=== API 호출 시작 ===');
      console.log('호출 URL: /api/chat/me/chatRooms');
      
      try {
        const response = await axiosInstance.get('/api/chat/me/chatRooms');  // axiosInstance 사용
        console.log('채팅방 목록 API 응답:', response);
        console.log('응답 데이터:', response.data);
        console.log('응답 데이터 타입:', typeof response.data);
        console.log('응답 데이터 길이:', response.data?.length);
        console.log('응답 데이터 구조:', JSON.stringify(response.data, null, 2));
        
        // API 응답 데이터가 있고 배열인 경우에만 사용
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('API 데이터로 업데이트:', response.data);
          // API 데이터의 id 필드 확인
          console.log('첫 번째 방의 id:', response.data[0]?.id);
          console.log('첫 번째 방의 roomId:', response.data[0]?.roomId);
          console.log('첫 번째 방의 모든 필드:', Object.keys(response.data[0] || {}));
          
          // API 데이터의 필드명을 통일 (roomId를 id로 매핑)
          const processedData = response.data.map(room => ({
            ...room,
            id: room.roomId || room.id // roomId가 있으면 id로 사용, 없으면 기존 id 사용
          }));
          console.log('처리된 데이터:', processedData);
          setRooms(processedData);
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          // 페이지네이션 응답 구조인 경우
          console.log('페이지네이션 데이터로 업데이트:', response.data.content);
          console.log('첫 번째 방의 id:', response.data.content[0]?.id);
          console.log('첫 번째 방의 roomId:', response.data.content[0]?.roomId);
          console.log('첫 번째 방의 모든 필드:', Object.keys(response.data.content[0] || {}));
          
          // API 데이터의 필드명을 통일 (roomId를 id로 매핑)
          const processedData = response.data.content.map(room => ({
            ...room,
            id: room.roomId || room.id // roomId가 있으면 id로 사용, 없으면 기존 id 사용
          }));
          console.log('처리된 페이지네이션 데이터:', processedData);
          setRooms(processedData);
        } else {
          console.log('API 응답이 배열이 아니거나 비어있어서 더미 데이터를 사용합니다.');
          console.log('API 응답 상태:', {
            hasData: !!response.data,
            isArray: Array.isArray(response.data),
            length: response.data?.length,
            data: response.data
          });
        }
      } catch (error) {
        console.error('채팅방 목록 가져오기 실패:', error);
        console.error('에러 상세:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        console.error('에러 URL:', error.config?.url);
        // 에러 발생 시 더미 데이터 유지
      }
    };

    fetchChatRooms();
  }, []);

  // 현재 경로에 따라 채팅방 링크 결정
  const getChatLink = (roomId) => {
    console.log('getChatLink 호출 - roomId:', roomId);
    console.log('현재 location.pathname:', location.pathname);
    
    if (location.pathname.startsWith('/admin')) {
      const link = `/admin/chats/${roomId}`;
      console.log('관리자 채팅 링크:', link);
      return link;
    } else {
      const link = `/chat/${roomId}`;
      console.log('일반 채팅 링크:', link);
      return link;
    }
  };

  // 읽지 않은 채팅방 개수 계산 (안전한 배열 처리)
  const unreadCount = Array.isArray(rooms) ? rooms.filter(room => room.notReadMessageCount > 0).length : 0;

  // 채팅방 클릭 시 읽음 처리
  const handleRoomClick = async (roomId) => {
    // 해당 채팅방 찾기
    const room = rooms.find(r => r.id === roomId);
    if (room && room.notReadMessageCount > 0) {
      // 즉시 UI 업데이트
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId ? { ...room, notReadMessageCount: 0 } : room
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
            {rooms.map((room, index) => (
              <li
                key={room.id || `room-${index}`}
                className={`flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                  ${room.id === roomId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  ${room.notReadMessageCount > 0 ? 'bg-yellow-50 border-l-2 border-l-yellow-400' : ''}`}
              >
                <Link to={getChatLink(room.id)} className="flex-1 min-w-0" onClick={() => handleRoomClick(room.id)}>
                  <div className={`font-medium truncate ${room.notReadMessageCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                    {room.title}
                    {room.notReadMessageCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                        {room.notReadMessageCount}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs truncate mt-1 ${room.notReadMessageCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
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