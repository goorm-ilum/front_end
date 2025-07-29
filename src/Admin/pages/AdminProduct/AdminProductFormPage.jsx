import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const continentCountryMap = {
  아시아: ['한국', '일본', '중국'],
  유럽: ['프랑스', '독일', '영국'],
  아메리카: ['미국', '캐나다', '브라질'],
  아프리카: ['이집트', '나이지리아', '남아프리카공화국'],
  오세아니아: ['호주', '뉴질랜드'],
};

const AdminProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState({
    name: '',
    price: '',
    discountPrice: '',
    startDate: '',
    endDate: '',
    stock: 1,
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [detailFiles, setDetailFiles] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);

  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();
        setForm({
          name: data.name,
          price: data.price,
          discountPrice: data.discountPrice,
          startDate: data.startDate?.split('T')[0] || '',
          endDate: data.endDate?.split('T')[0] || '',
          stock: data.stock,
        });
        setThumbnailPreview(data.thumbnailUrl || '');
        setDetailPreviews(data.detailImageUrls || []);
        setTags(data.tags || []);
        setContinent(data.continent || '');
        setCountry(data.country || '');
      } catch (err) {
        console.error(err);
        alert('상품 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 0) {
      setForm(prev => ({ ...prev, stock: v }));
    }
  };
  const incStock = () => setForm(prev => ({ ...prev, stock: prev.stock + 1 }));
  const decStock = () =>
    setForm(prev => ({ ...prev, stock: Math.max(prev.stock - 1, 0) }));

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setDetailFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setDetailPreviews(previews);
  };

  const handleTagInputChange = (e) => setTagInput(e.target.value);
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,+$/, '');
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
      }
      setTagInput('');
    }
  };
  const removeTag = (t) => setTags(prev => prev.filter(tag => tag !== t));

  const handleContinentChange = (e) => {
    const selectedContinent = e.target.value;
    setContinent(selectedContinent);
    setCountry('');
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('discountPrice', form.discountPrice);
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate);
      formData.append('stock', form.stock);
      formData.append('tags', tags.join(','));
      formData.append('continent', continent);
      formData.append('country', country);

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      detailFiles.forEach(file => formData.append('detailImages', file));

      const url = isEdit
        ? `/api/admin/products/${productId}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error('상품 저장 실패');

      const saved = await res.json();
      alert(`상품이 ${isEdit ? '수정' : '등록'}되었습니다.`);
      navigate(`/admin/products/${saved.id}`);
    } catch (err) {
      console.error(err);
      alert('상품 저장 중 오류가 발생했습니다.');
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
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        ← 뒤로가기
      </button>
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? '상품 수정' : '상품 등록'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* 상품명 */}
        <div>
          <label className="block mb-1 font-medium">상품명</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 대륙/국가 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">대륙</label>
            <select
              value={continent}
              onChange={handleContinentChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">대륙 선택</option>
              {Object.keys(continentCountryMap).map((cont) => (
                <option key={cont} value={cont}>
                  {cont}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">국가</label>
            <select
              value={country}
              onChange={handleCountryChange}
              disabled={!continent}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">국가 선택</option>
              {continent &&
                continentCountryMap[continent].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>
        
        {/* 썸네일 이미지 */}
        <div>
          <label className="block mb-1 font-medium">썸네일 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="block"
          />
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="썸네일 미리보기"
              className="mt-2 w-40 h-40 object-cover rounded"
            />
          )}
        </div>

        {/* 정상가 / 할인가 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">정상가</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">할인가</label>
            <input
              name="discountPrice"
              type="number"
              value={form.discountPrice}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* 시작일 / 마감일 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">시작일</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">마감일</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* 재고 */}
        <div className="flex items-center gap-2">
          <label className="font-medium">재고</label>
          <button
            type="button"
            onClick={decStock}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            –
          </button>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleStockChange}
            className="w-20 text-center border px-2 py-1 rounded"
          />
          <button
            type="button"
            onClick={incStock}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            +
          </button>
        </div>

        {/* 상세 이미지 */}
        <div>
          <label className="block mb-1 font-medium">상세설명 이미지</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleDetailImagesChange}
            className="block"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {detailPreviews.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`상세 이미지 ${idx + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="block mb-1 font-medium">태그</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            placeholder="Enter 또는 쉼표로 태그 추가"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 저장 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? isEdit
                ? '수정중…'
                : '등록중…'
              : isEdit
              ? '수정하기'
              : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
