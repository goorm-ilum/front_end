import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomLogin } from '../../../common/hook/useCustomLogin';

const MyInfo = () => {
  const navigate = useNavigate();
  const { memberId, isLogin } = useCustomLogin();

  const [countryCode, setCountryCode] = useState('+82');
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');

  const [form, setForm] = useState({
    memberId: '',
    account_email: '',
    gender: '',
    birthday: '',
    name: '',
    nickname: '',
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 전화번호에서 국가코드와 나머지 번호 분리하는 함수 (하이픈 제거)
  const splitPhoneNumber = (phoneNum) => {
    if (!phoneNum) return { countryCode: '+82', localNumber: '' };

    const parts = phoneNum.trim().split(' ');
    if (parts.length === 2) {
      const countryCode = parts[0];
      const localNumber = parts[1].replace(/-/g, ''); // 하이픈 제거
      return { countryCode, localNumber };
    } else {
      return {
        countryCode: '+82',
        localNumber: phoneNum.replace(/-/g, ''),
      };
    }
  };

  // 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/member/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('프로필 조회 실패');
        const data = await res.json();

        const { countryCode, localNumber } = splitPhoneNumber(data.phoneNum || '');

        setCountryCode(countryCode);
        setLocalPhoneNumber(localNumber); // 숫자만 저장

        setForm({
          memberId: data.memberId || '',
          account_email: data.accountEmail || '',
          gender: data.gender || '',
          birthday: data.birthday || '',
          name: data.name || '',
          nickname: data.nickname || '',
        });
        setPreviewUrl(data.profileImage || '');
      } catch (err) {
        console.error(err);
        alert('프로필 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (!isLogin) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }

    if (memberId) {
      fetchProfile();
    }
  }, [memberId, isLogin, navigate]);

  // 입력값 변경 처리 (전화번호는 따로 처리)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_num') {
      // 전화번호는 여기서 바로 state 업데이트하지 않음 (로컬번호 별도 관리)
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 전화번호 로컬번호 입력 핸들링 (숫자만 받음)
  const handleLocalPhoneChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9]/g, ''); // 숫자만 필터링
    setLocalPhoneNumber(cleaned);
  };

  // 이미지 변경 핸들링
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

  // 폼 제출 시 전화번호 합쳐서 서버 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 수정할 정보들을 JSON 객체로 만듦
      const updateData = {
        name: form.name,
        gender: form.gender,
        birthday: form.birthday,
        phoneNum: `${countryCode} ${localPhoneNumber}`,
      };

      const formData = new FormData();
      // 'info'라는 키에 JSON 형태를 Blob으로 감싸서 넣어줘야 함
      formData.append('info', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));

      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }

      const res = await fetch('/api/member/me', {
        method: 'PUT',
        body: formData,
        credentials: 'include',
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
      <h1 className="text-2xl font-semibold mb-6">내 정보 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border">
              {previewUrl ? (
                <img src={previewUrl} alt="프로필 미리보기" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  이미지 없음
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="cursor-pointer bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-3 py-1 rounded-full text-xs transition-all duration-200">
                  사진 변경
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="w-80 space-y-4">
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
              <div className="flex gap-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={form.gender === 'M'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  남성
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={form.gender === 'F'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  여성
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            readOnly
            className="flex-1 bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

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

        <div className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">전화번호</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={countryCode}
              readOnly
              className="w-16 border px-3 py-2 rounded bg-gray-100 text-center"
            />
            <input
              name="phone_num"
              type="tel"
              value={localPhoneNumber}
              onChange={handleLocalPhoneChange}
              className="flex-1 border px-3 py-2 rounded"
              placeholder="예: 01012345678"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '수정 중…' : '수정하기'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          ← 뒤로가기
        </button>
      </div>
    </div>
  );
};

export default MyInfo;
