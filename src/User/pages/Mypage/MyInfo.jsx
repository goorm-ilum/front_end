import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyInfo = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    account_email: '',
    phone_num: '',
    gender: '',
    birthday: '',
    name: '',
    nickname: '',
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('프로필 조회 실패');
        const data = await res.json();

        setForm({
          account_email: data.account_email || '',
          phone_num: data.phone_num || '',
          gender: data.gender || '',
          birthday: data.birthday ? data.birthday.split('T')[0] : '',
          name: data.name || '',
          nickname: data.nickname || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
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
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        ← 뒤로가기
      </button>

      <h1 className="text-2xl font-semibold mb-6">내 정보 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        {/* 상단: 이미지 + 이름/성별 */}
        <div className="flex items-start gap-6">
          {/* 프로필 이미지 미리보기 */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  이미지 없음
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 text-sm"
            />
          </div>

          {/* 이름 + 성별 */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
                <option value="U">선택안함</option>
              </select>
            </div>
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">이메일</label>
          <input
            name="account_email"
            type="email"
            value={form.account_email}
            readOnly
            className="flex-1 bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

        {/* 전화번호 */}
        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">전화번호</label>
          <input
            name="phone_num"
            type="tel"
            value={form.phone_num}
            onChange={handleChange}
            className="flex-1 border px-3 py-2 rounded"
          />
        </div>

        {/* 생년월일 */}
        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">생년월일</label>
          <input
            name="birthday"
            type="date"
            value={form.birthday}
            onChange={handleChange}
            className="flex-1 border px-3 py-2 rounded"
          />
        </div>

        {/* 닉네임 */}
        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            className="flex-1 border px-3 py-2 rounded"
          />
        </div>

        {/* 저장 버튼 */}
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

export default MyInfo;
