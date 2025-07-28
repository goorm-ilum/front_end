// src/pages/admin/profile/AdminProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProfilePage = () => {
  const navigate = useNavigate();

  // 폼 상태
  const [form, setForm] = useState({
    user_id: '',         // 읽기전용
    account_email: '',   // 읽기전용
    phone_num: '',
    gender: '',          // 'M' | 'F' | 'U'
    birthday: '',        // YYYY-MM-DD
    name: '',
    nickname: '',
    business_num: '',    // 읽기전용
  });

  // 프로필 이미지 파일 + 미리보기 URL
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1) 마운트 시 서버에서 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile');
        if (!res.ok) throw new Error('프로필 조회 실패');
        const data = await res.json();

        setForm({
          user_id: data.user_id,
          account_email: data.account_email,
          phone_num: data.phone_num || '',
          gender: data.gender || '',
          birthday: data.birthday ? data.birthday.split('T')[0] : '',
          name: data.name || '',
          nickname: data.nickname || '',
          business_num: data.business_num || '',
        });
        setPreviewUrl(data.profile_image || '');
      } catch (err) {
        console.error(err);
        alert('프로필 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2) 텍스트·select 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 3) 이미지 파일 선택 핸들러 & 미리보기 생성
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 4) 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('phone_num', form.phone_num);
      formData.append('gender', form.gender);
      formData.append('birthday', form.birthday);
      formData.append('name', form.name);
      formData.append('nickname', form.nickname);
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        body: formData,      // Content-Type 헤더를 자동으로 multipart/form-data 처리
      });
      if (!res.ok) throw new Error('프로필 업데이트 실패');

      alert('프로필이 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error(err);
      alert('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">로딩 중…</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        ← 뒤로가기
      </button>

      <h1 className="text-2xl font-semibold mb-6">내 정보 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {/* 회원 ID (읽기전용) */}
        <div>
          <label className="block mb-1 font-medium">회원 ID</label>
          <input
            name="user_id"
            value={form.user_id}
            readOnly
            className="w-full bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

        {/* 이메일 (읽기전용) */}
        <div>
          <label className="block mb-1 font-medium">이메일</label>
          <input
            name="account_email"
            type="email"
            value={form.account_email}
            readOnly
            className="w-full bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block mb-1 font-medium">전화번호</label>
          <input
            name="phone_num"
            type="tel"
            value={form.phone_num}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 성별 */}
        <div>
          <label className="block mb-1 font-medium">성별</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">선택하세요</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
            <option value="U">선택안함</option>
          </select>
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block mb-1 font-medium">생년월일</label>
          <input
            name="birthday"
            type="date"
            value={form.birthday}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 이름 */}
        <div>
          <label className="block mb-1 font-medium">이름</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 닉네임 */}
        <div>
          <label className="block mb-1 font-medium">닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 프로필 이미지 업로드 */}
        <div>
          <label className="block mb-1 font-medium">프로필 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="mt-2 w-24 h-24 object-cover rounded-full"
            />
          )}
        </div>

        {/* 사업자번호 (읽기전용) */}
        <div>
          <label className="block mb-1 font-medium">사업자번호</label>
          <input
            name="business_num"
            value={form.business_num}
            readOnly
            className="w-full bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '저장 중…' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfilePage;