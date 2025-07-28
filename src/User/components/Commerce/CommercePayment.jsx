import { useState } from 'react';

const CommercePayment = () => {
  const [form, setForm] = useState({ name: '', card: '' });
  const [paid, setPaid] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setPaid(true);
  };

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-green-600">결제가 완료되었습니다!</h2>
        <div className="text-gray-700">즐거운 여행 되세요 :)</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">결제하기</h2>
      <label className="flex flex-col gap-1">
        이름
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        카드번호
        <input
          type="text"
          name="card"
          value={form.card}
          onChange={handleChange}
          required
          maxLength={16}
          pattern="[0-9]{16}"
          className="border rounded px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 mt-4"
      >
        결제하기
      </button>
    </form>
  );
};

export default CommercePayment;
