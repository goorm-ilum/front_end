// src/common/util/failedMessageUtil.jsx
import { getCookie, setCookie, removeCookie } from './cookieUtil';

const FAILED_MESSAGES_COOKIE_KEY = 'failedChatMessages';
const COOKIE_EXPIRE_DAYS = 7; // 7일 후 만료

/**
 * 실패한 메시지를 쿠키에 저장
 * @param {Object} messageData - 실패한 메시지 데이터
 * @param {string} error - 에러 메시지
 */
export const saveFailedMessage = (messageData, error = '') => {
  try {
    const existingFailedMessages = getFailedMessages();
    
    const failedMessage = {
      id: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      error: error,
      failedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'failed' // 'failed', 'retrying', 'abandoned'
    };

    const updatedFailedMessages = [...existingFailedMessages, failedMessage];
    
    // 쿠키 크기 제한을 위해 최대 10개까지만 저장
    const limitedMessages = updatedFailedMessages.slice(-10);
    
    setCookie(FAILED_MESSAGES_COOKIE_KEY, JSON.stringify(limitedMessages), COOKIE_EXPIRE_DAYS);
    
    console.log('💾 실패한 메시지 쿠키에 저장:', failedMessage);
    return failedMessage.id;
  } catch (error) {
    console.error('❌ 실패한 메시지 저장 실패:', error);
    return null;
  }
};

/**
 * 쿠키에서 실패한 메시지들을 가져옴
 * @returns {Array} 실패한 메시지 배열
 */
export const getFailedMessages = () => {
  try {
    const cookieData = getCookie(FAILED_MESSAGES_COOKIE_KEY);
    if (!cookieData) return [];
    
    const failedMessages = JSON.parse(cookieData);
    return Array.isArray(failedMessages) ? failedMessages : [];
  } catch (error) {
    console.error('❌ 실패한 메시지 조회 실패:', error);
    return [];
  }
};

/**
 * 특정 실패한 메시지를 업데이트
 * @param {string} messageId - 메시지 ID
 * @param {Object} updates - 업데이트할 데이터
 */
export const updateFailedMessage = (messageId, updates) => {
  try {
    const failedMessages = getFailedMessages();
    const updatedMessages = failedMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, ...updates, updatedAt: new Date().toISOString() }
        : msg
    );
    
    setCookie(FAILED_MESSAGES_COOKIE_KEY, JSON.stringify(updatedMessages), COOKIE_EXPIRE_DAYS);
    console.log('🔄 실패한 메시지 업데이트:', messageId, updates);
  } catch (error) {
    console.error('❌ 실패한 메시지 업데이트 실패:', error);
  }
};

/**
 * 특정 실패한 메시지를 제거
 * @param {string} messageId - 메시지 ID
 */
export const removeFailedMessage = (messageId) => {
  try {
    const failedMessages = getFailedMessages();
    const filteredMessages = failedMessages.filter(msg => msg.id !== messageId);
    
    if (filteredMessages.length === 0) {
      removeCookie(FAILED_MESSAGES_COOKIE_KEY);
    } else {
      setCookie(FAILED_MESSAGES_COOKIE_KEY, JSON.stringify(filteredMessages), COOKIE_EXPIRE_DAYS);
    }
    
    console.log('🗑️ 실패한 메시지 제거:', messageId);
  } catch (error) {
    console.error('❌ 실패한 메시지 제거 실패:', error);
  }
};

/**
 * 특정 방의 실패한 메시지들만 가져옴
 * @param {string} roomId - 방 ID
 * @returns {Array} 해당 방의 실패한 메시지 배열
 */
export const getFailedMessagesByRoom = (roomId) => {
  const allFailedMessages = getFailedMessages();
  return allFailedMessages.filter(msg => msg.roomId === roomId);
};

/**
 * 오래된 실패한 메시지들을 정리 (7일 이상 된 것들)
 */
export const cleanupOldFailedMessages = () => {
  try {
    const failedMessages = getFailedMessages();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const validMessages = failedMessages.filter(msg => {
      const failedAt = new Date(msg.failedAt);
      return failedAt > sevenDaysAgo;
    });
    
    if (validMessages.length !== failedMessages.length) {
      if (validMessages.length === 0) {
        removeCookie(FAILED_MESSAGES_COOKIE_KEY);
      } else {
        setCookie(FAILED_MESSAGES_COOKIE_KEY, JSON.stringify(validMessages), COOKIE_EXPIRE_DAYS);
      }
      console.log('🧹 오래된 실패한 메시지 정리 완료:', failedMessages.length - validMessages.length, '개 제거');
    }
  } catch (error) {
    console.error('❌ 실패한 메시지 정리 실패:', error);
  }
};

/**
 * 모든 실패한 메시지를 제거
 */
export const clearAllFailedMessages = () => {
  try {
    removeCookie(FAILED_MESSAGES_COOKIE_KEY);
    console.log('🧹 모든 실패한 메시지 제거 완료');
  } catch (error) {
    console.error('❌ 실패한 메시지 전체 제거 실패:', error);
  }
};

/**
 * 재전송 횟수 증가
 * @param {string} messageId - 메시지 ID
 */
export const incrementRetryCount = (messageId) => {
  const failedMessages = getFailedMessages();
  const message = failedMessages.find(msg => msg.id === messageId);
  
  if (message) {
    const newRetryCount = (message.retryCount || 0) + 1;
    updateFailedMessage(messageId, { 
      retryCount: newRetryCount,
      status: newRetryCount >= 3 ? 'abandoned' : 'failed' // 3회 이상 실패시 포기
    });
    return newRetryCount;
  }
  
  return 0;
};
