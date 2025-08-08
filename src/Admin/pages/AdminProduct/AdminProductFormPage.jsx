import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuccessModal from '../../../components/SuccessModal';
import MessagePopup from '../../../common/components/MessagePopup';

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
    productName: '',
    description: '',
    price: '',
    discountPrice: '',
    countryName: '',
  });

  const [startDates, setStartDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // 옵션 입력용 상태
  const [options, setOptions] = useState([
    {
      optionName: '',
      price: '',
      discountPrice: '',
      stock: 1
    }
  ]);

  // 날짜별 옵션 데이터 (백엔드로 전송할 최종 데이터)
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDateForView, setSelectedDateForView] = useState('');
  // 임시 수정 상태 (적용 버튼을 누르기 전까지의 변경사항)
  const [tempDateOptions, setTempDateOptions] = useState({});
  // 원본 데이터 백업 (되돌리기용)
  const [originalDateOptions, setOriginalDateOptions] = useState({});

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailHash, setThumbnailHash] = useState('');
  const [detailFiles, setDetailFiles] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);
  const [detailImageIds, setDetailImageIds] = useState([]);
  const [detailImageTypes, setDetailImageTypes] = useState([]); // 'existing' 또는 'new'

  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messagePopupText, setMessagePopupText] = useState('');
  const [messagePopupType, setMessagePopupType] = useState('info');

  // 달력 관련 함수들
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateSelected = (dateStr) => {
    return startDates.includes(dateStr);
  };

  const handleDateClick = (dateStr) => {
    if (isDateSelected(dateStr)) {
      setStartDates(prev => prev.filter(date => date !== dateStr));
      // 날짜가 제거되면 해당 날짜의 옵션도 제거
      setDateOptions(prev => prev.filter(option => option.startDate !== dateStr));
    } else {
      setStartDates(prev => [...prev, dateStr].sort());
      // 새로운 날짜가 선택되면 날짜별 옵션에서 해당 날짜 표시
      setSelectedDateForView(dateStr);
    }
  };

  // 날짜별 옵션에서 날짜 변경
  const handleDateViewChange = (dateStr) => {
    setSelectedDateForView(dateStr);
    // 임시 수정사항 초기화 (다른 날짜로 이동할 때)
    setTempDateOptions(prev => {
      const newTemp = { ...prev };
      delete newTemp[dateStr];
      return newTemp;
    });
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // 이전 달의 마지막 날들
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-300"></div>);
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(currentYear, currentMonth, day));
      const isSelected = isDateSelected(dateStr);
      const isPast = new Date(dateStr) < new Date(formatDate(today));
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && handleDateClick(dateStr)}
          disabled={isPast}
          className={`p-2 rounded ${
            isSelected 
              ? 'bg-blue-500 text-white' 
              : isPast 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        console.log('상품 정보 불러오는 중...');
        const res = await fetch(`/api/admin/products/${productId}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('받은 상품 데이터:', data);
        
        // 기본 폼 정보 설정
        setForm({
          productName: data.productName || '',
          description: data.description || '',
          price: data.price || '',
          discountPrice: data.discountPrice || '',
          countryName: data.country || '',
        });
        
                          // 이미지 정보 설정
         if (data.thumbnailImageUrl) {
           setThumbnailPreview(data.thumbnailImageUrl);
         }
         
         if (data.thumbnailImageHash) {
           setThumbnailHash(data.thumbnailImageHash);
         }
         
                   if (data.images && Array.isArray(data.images)) {
            // images가 ImageInfo 객체 배열로 변경됨 (ID 기반)
            const imageUrls = data.images.map(img => img.imageUrl || img);
            const imageIds = data.images.map(img => img.imageId || img.id || '');
            const imageTypes = data.images.map(() => 'existing'); // 기존 이미지들은 'existing' 타입
            setDetailPreviews(imageUrls);
            setDetailImageIds(imageIds);
            setDetailImageTypes(imageTypes);
            // detailFiles는 기존 이미지에 대해서는 null로 설정 (기존 이미지는 File 객체가 아님)
            setDetailFiles(data.images.map(() => null));
          } else {
            // 이미지가 없는 경우 모든 배열을 빈 배열로 초기화
            setDetailPreviews([]);
            setDetailImageIds([]);
            setDetailImageTypes([]);
            setDetailFiles([]);
          }
        
        // 태그 정보 설정
        if (data.hashtags && Array.isArray(data.hashtags)) {
          setTags(data.hashtags);
        }
        
        // 대륙/국가 정보 설정
        if (data.continent && data.country) {
          setContinent(data.continent);
          setCountry(data.country);
        }
        
        // 시작일 정보 설정 - options 배열에서 고유한 startDate 추출
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          const uniqueStartDates = [...new Set(data.options.map(option => option.startDate))].sort();
          setStartDates(uniqueStartDates);
        }
        
        // 옵션 정보 설정
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          setDateOptions(data.options);
          
          // 고유한 옵션들을 추출하여 옵션 설정에 표시
          const uniqueOptions = [];
          const seenOptions = new Set();
          
          data.options.forEach(option => {
            if (!seenOptions.has(option.optionName)) {
              seenOptions.add(option.optionName);
              uniqueOptions.push({
                optionName: option.optionName,
                price: option.price,
                discountPrice: option.discountPrice,
                stock: option.stock
              });
            }
          });
          
          setOptions(uniqueOptions.length > 0 ? uniqueOptions : [{
            optionName: '',
            price: '',
            discountPrice: '',
            stock: 1
          }]);
        } else {
          // 옵션이 없으면 기본 옵션 하나 생성
          setOptions([{
            optionName: '',
            price: '',
            discountPrice: '',
            stock: 1
          }]);
          setDateOptions([]);
        }
        
        console.log('폼 데이터 설정 완료');
      } catch (err) {
        console.error('상품 정보 불러오기 실패:', err);
        setMessagePopupText('상품 정보를 불러오는 데 실패했습니다.');
        setMessagePopupType('error');
        setShowMessagePopup(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
    
    // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setThumbnailHash('');
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('=== handleDetailImagesChange 디버깅 ===');
    console.log('handleDetailImagesChange 호출됨');
    console.log('이벤트 객체:', e);
    console.log('e.target:', e?.target);
    console.log('e.target.files:', e?.target?.files);
    console.log('=== handleDetailImagesChange 디버깅 ===');

    console.log('선택된 파일들:', files);
    console.log('파일 개수:', files.length);
    
    if (files.length === 0) {
      console.log('선택된 파일이 없습니다.');
      return;
    }
    
    const newPreviews = files.map(f => URL.createObjectURL(f));
    const newTypes = files.map(() => 'new');
    
    console.log('새로운 미리보기들:', newPreviews);
    console.log('새로운 타입들:', newTypes);
    
         // 기존 이미지들과 새로 업로드된 이미지들을 합침
     setDetailFiles(prev => {
       const newFiles = [...prev, ...files];
       console.log('업데이트된 detailFiles:', newFiles);
       console.log('detailFiles 길이:', newFiles.length);
       console.log('각 파일 정보:');
       newFiles.forEach((file, index) => {
         console.log(`  [${index}]:`, file ? `${file.name} (${file.type}, ${file.size} bytes)` : 'null');
       });
       return newFiles;
     });
         setDetailPreviews(prev => {
       const updatedPreviews = [...prev, ...newPreviews];
       console.log('업데이트된 detailPreviews:', updatedPreviews);
       return updatedPreviews;
     });
    setDetailImageIds(prev => {
      const newIds = [...prev, ...files.map(() => '')];
      console.log('업데이트된 detailImageIds:', newIds);
      return newIds;
    });
         setDetailImageTypes(prev => {
       const updatedTypes = [...prev, ...newTypes];
       console.log('업데이트된 detailImageTypes:', updatedTypes);
       return updatedTypes;
     });
    
    // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
  };

  const removeDetailImage = (index) => {
    setDetailFiles(prev => prev.filter((_, i) => i !== index));
    setDetailPreviews(prev => prev.filter((_, i) => i !== index));
    setDetailImageIds(prev => prev.filter((_, i) => i !== index));
    setDetailImageTypes(prev => prev.filter((_, i) => i !== index));
  };

  // 이미지 순서 변경 함수들
  const moveImageUp = (index) => {
    if (index === 0) return;
    
    setDetailFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
    
    setDetailPreviews(prev => {
      const newPreviews = [...prev];
      [newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]];
      return newPreviews;
    });
    
              setDetailImageIds(prev => {
       const newIds = [...prev];
       [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
       return newIds;
     });
    
    setDetailImageTypes(prev => {
      const newTypes = [...prev];
      [newTypes[index - 1], newTypes[index]] = [newTypes[index], newTypes[index - 1]];
      return newTypes;
    });
  };

  const moveImageDown = (index) => {
    if (index === detailPreviews.length - 1) return;
    
    setDetailFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
    
    setDetailPreviews(prev => {
      const newPreviews = [...prev];
      [newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]];
      return newPreviews;
    });
    
              setDetailImageIds(prev => {
       const newIds = [...prev];
       [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
       return newIds;
     });
    
    setDetailImageTypes(prev => {
      const newTypes = [...prev];
      [newTypes[index], newTypes[index + 1]] = [newTypes[index + 1], newTypes[index]];
      return newTypes;
    });
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
    setForm(prev => ({ ...prev, countryName: '' }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setForm(prev => ({ ...prev, countryName: selectedCountry }));
  };

  // 옵션 관련 함수들
  const addOption = () => {
    setOptions(prev => [...prev, {
      optionName: '',
      price: '',
      discountPrice: '',
      stock: 1
    }]);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      setOptions(prev => prev.filter((_, i) => i !== index));
      
      // 모든 날짜에서 해당 인덱스의 옵션 삭제
      setDateOptions(prev => {
        const newDateOptions = [...prev];
        
        startDates.forEach(date => {
          const dateOptions = newDateOptions.filter(item => item.startDate === date);
          if (dateOptions[index]) {
            const globalIndex = newDateOptions.findIndex(item => 
              item.startDate === date && item === dateOptions[index]
            );
            if (globalIndex >= 0) {
              newDateOptions.splice(globalIndex, 1);
            }
          }
        });
        
        return newDateOptions;
      });
    }
  };

  const updateOption = (index, field, value) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  // 옵션 적용 관련 함수들
  const applyOptionToDates = (optionIndex, field) => {
    if (startDates.length === 0) return;
    
    const option = options[optionIndex];
    const value = option[field];
    
    // 각 필드별 유효성 검사
    if (field === 'optionName' && !value.trim()) {
              setMessagePopupText('옵션명을 입력해주세요.');
        setMessagePopupType('error');
        setShowMessagePopup(true);
      return;
    }
    if (field === 'stock' && (value === '' || parseInt(value) < 1)) {
              setMessagePopupText('재고는 최소 1 이상 입력해주세요.');
        setMessagePopupType('error');
        setShowMessagePopup(true);
      return;
    }
    if (field === 'price' && (value === '' || parseInt(value) < 1)) {
              setMessagePopupText('정상가는 최소 1 이상 입력해주세요.');
        setMessagePopupType('error');
        setShowMessagePopup(true);
      return;
    }
    
    setDateOptions(prev => {
      const newDateOptions = [...prev];
      
      startDates.forEach(date => {
        // 해당 날짜의 옵션들을 가져와서 인덱스로 매칭
        const dateOptions = newDateOptions.filter(item => item.startDate === date);
        
        if (dateOptions[optionIndex]) {
          // 해당 인덱스의 옵션이 있으면 업데이트
          const globalIndex = newDateOptions.findIndex(item => 
            item.startDate === date && item === dateOptions[optionIndex]
          );
          
          if (globalIndex >= 0) {
            newDateOptions[globalIndex] = {
              ...newDateOptions[globalIndex],
              [field]: value
            };
          }
        } else {
          // 해당 인덱스의 옵션이 없으면 새로 추가
          newDateOptions.push({
            startDate: date,
            optionName: option.optionName,
            stock: option.stock,
            price: option.price,
            discountPrice: option.discountPrice,
            [field]: value
          });
        }
      });
      
      return newDateOptions;
    });
    
    // 문법에 맞는 성공 메시지 설정
    let successMessage = '';
    if (field === 'optionName') {
      successMessage = '옵션명이 적용되었습니다.';
    } else if (field === 'stock') {
      successMessage = '재고가 적용되었습니다.';
    } else if (field === 'price') {
      successMessage = '정상가가 적용되었습니다.';
    } else if (field === 'discountPrice') {
      successMessage = '할인가가 적용되었습니다.';
    }
    
            setMessagePopupText(successMessage);
        setMessagePopupType('success');
        setShowMessagePopup(true);
  };

  const applyAllOptionsToDates = () => {
    if (startDates.length === 0) return;
    
    // 모든 옵션에 대해 옵션명, 재고, 정상가가 비어있거나 1 미만인지 확인
    const emptyFields = [];
    options.forEach((option, index) => {
      if (!option.optionName.trim()) {
        emptyFields.push(`${index + 1}번 옵션의 옵션명`);
      }
      if (option.stock === '' || parseInt(option.stock) < 1) {
        emptyFields.push(`${index + 1}번 옵션의 재고 (최소 1 이상)`);
      }
      if (option.price === '' || parseInt(option.price) < 1) {
        emptyFields.push(`${index + 1}번 옵션의 정상가 (최소 1 이상)`);
      }
    });
    
    if (emptyFields.length > 0) {
      setMessagePopupText(`다음 항목들을 입력해주세요:\n\n${emptyFields.join('\n')}`);
      setMessagePopupType('error');
      setShowMessagePopup(true);
      return;
    }
    
    const validOptions = options.filter(option => 
      option.optionName.trim() && 
      option.price !== '' && parseInt(option.price) >= 1 &&
      option.stock !== '' && parseInt(option.stock) >= 1
    );
    
    if (validOptions.length === 0) {
      setMessagePopupText('적용할 옵션을 먼저 입력해주세요.');
      setMessagePopupType('error');
      setShowMessagePopup(true);
      return;
    }
    
    setDateOptions(prev => {
      let newDateOptions = [...prev];
      
      startDates.forEach(date => {
        // 해당 날짜의 기존 옵션들을 모두 제거
        newDateOptions = newDateOptions.filter(item => item.startDate !== date);
        
        // 새로운 옵션들을 인덱스 순서대로 추가
        validOptions.forEach((option, index) => {
          newDateOptions.push({
            startDate: date,
            optionName: option.optionName,
            stock: parseInt(option.stock) || 0,
            price: parseInt(option.price) || 0,
            discountPrice: parseInt(option.discountPrice) || parseInt(option.price) || 0
          });
        });
      });
      
      return newDateOptions;
    });
    
            setMessagePopupText('모든 옵션이 적용되었습니다.');
        setMessagePopupType('success');
        setShowMessagePopup(true);
  };

  // 특정 날짜의 옵션들 가져오기 (임시 수정사항 포함)
  const getOptionsForDate = (date) => {
    const originalOptions = dateOptions.filter(option => option.startDate === date);
    const tempOptions = tempDateOptions[date];
    
    if (!tempOptions) {
      return originalOptions;
    }
    
    return originalOptions.map((option, index) => {
      // 임시 수정사항에서 해당 인덱스의 옵션을 찾기
      const tempOption = tempOptions[index];
      if (tempOption) {
        return { ...option, ...tempOption };
      }
      return option;
    });
  };

  // 특정 날짜의 옵션 임시 업데이트
  const updateDateOption = (date, optionIndex, field, value) => {
    const originalOptions = dateOptions.filter(option => option.startDate === date);
    const option = originalOptions[optionIndex];
    
    if (!option) return;
    
    // 원본 데이터 백업 (처음 수정할 때만)
    if (!originalDateOptions[date]) {
      setOriginalDateOptions(prev => ({
        ...prev,
        [date]: originalOptions
      }));
    }
    
    setTempDateOptions(prev => {
      const currentTemp = prev[date] || [];
      
      // 인덱스로 임시 데이터 찾기
      let newTemp = [...currentTemp];
      
      if (newTemp[optionIndex]) {
        // 기존 임시 데이터 업데이트
        newTemp[optionIndex] = { ...newTemp[optionIndex], [field]: value };
      } else {
        // 새로운 임시 데이터 추가
        newTemp[optionIndex] = { optionName: option.optionName, [field]: value };
      }
      
      return {
        ...prev,
        [date]: newTemp
      };
    });
  };

  // 특정 날짜의 옵션 삭제
  const removeDateOption = (date, optionIndex) => {
    setDateOptions(prev => {
      const newDateOptions = [...prev];
      const dateOptions = newDateOptions.filter(option => option.startDate === date);
      const globalIndex = newDateOptions.findIndex(option => 
        option.startDate === date && option.optionName === dateOptions[optionIndex]?.optionName
      );
      
      if (globalIndex >= 0) {
        newDateOptions.splice(globalIndex, 1);
      }
      
      return newDateOptions;
    });
    
            setMessagePopupText('옵션이 삭제되었습니다.');
        setMessagePopupType('success');
        setShowMessagePopup(true);
  };

  // 특정 날짜의 모든 옵션 삭제
  const removeAllDateOptions = (date) => {
    setDateOptions(prev => prev.filter(option => option.startDate !== date));
    
            setMessagePopupText('모든 옵션이 삭제되었습니다.');
        setMessagePopupType('success');
        setShowMessagePopup(true);
  };

  // 특정 날짜의 옵션 적용
  const applyOptionsToDate = (date) => {
    // 모든 옵션에 대해 옵션명, 재고, 정상가가 비어있거나 1 미만인지 확인
    const emptyFields = [];
    options.forEach((option, index) => {
      if (!option.optionName.trim()) {
        emptyFields.push(`${index + 1}번 옵션의 옵션명`);
      }
      if (option.stock === '' || parseInt(option.stock) < 1) {
        emptyFields.push(`${index + 1}번 옵션의 재고 (최소 1 이상)`);
      }
      if (option.price === '' || parseInt(option.price) < 1) {
        emptyFields.push(`${index + 1}번 옵션의 정상가 (최소 1 이상)`);
      }
    });
    
    if (emptyFields.length > 0) {
      setMessagePopupText(`다음 항목들을 입력해주세요:\n\n${emptyFields.join('\n')}`);
      setMessagePopupType('error');
      setShowMessagePopup(true);
      return;
    }
    
    const validOptions = options.filter(option => 
      option.optionName.trim() && 
      option.price !== '' && parseInt(option.price) >= 1 &&
      option.stock !== '' && parseInt(option.stock) >= 1
    );
    
    if (validOptions.length === 0) {
      setMessagePopupText('적용할 옵션을 먼저 입력해주세요.');
      setMessagePopupType('error');
      setShowMessagePopup(true);
      return;
    }
    
    setDateOptions(prev => {
      const newDateOptions = prev.filter(option => option.startDate !== date);
      
      validOptions.forEach(option => {
        newDateOptions.push({
          startDate: date,
          optionName: option.optionName,
          stock: parseInt(option.stock) || 0,
          price: parseInt(option.price) || 0,
          discountPrice: parseInt(option.discountPrice) || parseInt(option.price) || 0
        });
      });
      
      return newDateOptions;
    });
    
    setMessagePopupText('옵션이 적용되었습니다.');
    setMessagePopupType('success');
    setShowMessagePopup(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 항목 검증
    const errors = [];
    
    if (!form.productName.trim()) {
      errors.push('상품명을 입력해주세요.');
    }
    
    if (!form.description.trim()) {
      errors.push('상품 설명을 입력해주세요.');
    }
    
    if (!form.countryName) {
      errors.push('국가를 선택해주세요.');
    }
    
    if (startDates.length === 0) {
      errors.push('시작일을 최소 하나 이상 선택해주세요.');
    }
    
    // 날짜별 옵션 검증
    if (dateOptions.length === 0) {
      errors.push('날짜별 옵션을 최소 하나 이상 적용해주세요.');
    }
    
    // 에러가 있으면 알림 표시
    if (errors.length > 0) {
      setMessagePopupText('다음 항목들을 확인해주세요:\n\n' + errors.join('\n'));
      setMessagePopupType('error');
      setShowMessagePopup(true);
      return;
    }
    
    setSubmitting(true);

    try {
             // request 객체 생성
       const requestData = {
         productName: form.productName.trim(),
         description: form.description.trim(),
         countryName: form.countryName,
         hashtags: tags,
         options: dateOptions
       };

       // 수정 시 기존 이미지 정보 추가
       if (isEdit) {
         // 기존 썸네일 해시 추가 (새로 업로드하지 않은 경우)
         if (!thumbnailFile && thumbnailHash && thumbnailHash.trim() !== '') {
           requestData.existingThumbnailHash = thumbnailHash;
         }
         
         // 기존 상세 이미지 ID들 추가
         if (detailImageIds.length > 0) {
           const existingIds = detailImageIds.filter((id, index) => 
             detailImageTypes[index] === 'existing' && id && id !== ''
           );
           if (existingIds.length > 0) {
             // 문자열 ID를 숫자로 변환
             requestData.existingDetailImageIds = existingIds.map(id => parseInt(id));
           }
         }
       }

      const formData = new FormData();
      
      // request를 JSON 문자열로 변환하여 추가
      formData.append('request', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));

                    // 썸네일 이미지 추가
       if (thumbnailFile) {
         formData.append('thumbnailImage', thumbnailFile);
         console.log('썸네일 이미지 추가됨:', thumbnailFile.name);
       } else if (isEdit && thumbnailHash && thumbnailHash.trim() !== '') {
         // 수정 시 기존 썸네일이 있고 새로 업로드하지 않은 경우
         console.log('기존 썸네일 이미지 유지 (해시:', thumbnailHash + ')');
       }

               // 상세 이미지들 추가
        console.log('=== 상세 이미지 디버깅 ===');
        console.log('detailFiles:', detailFiles);
        console.log('detailFiles 길이:', detailFiles.length);
        console.log('detailImageTypes:', detailImageTypes);
        console.log('detailImageTypes 길이:', detailImageTypes.length);
        console.log('detailImageIds:', detailImageIds);
        console.log('detailImageIds 길이:', detailImageIds.length);
        
                 // 각 배열의 인덱스별 상태 확인
         if (detailFiles && detailFiles.length > 0) {
           detailFiles.forEach((file, index) => {
             console.log(`인덱스 ${index}:`, {
               file: file ? file.name : 'null',
               type: detailImageTypes[index] || 'unknown',
               id: detailImageIds[index] || ''
             });
           });
         } else {
           console.log('detailFiles가 비어있습니다.');
         }
        
                 const newFiles = detailFiles.filter((file, index) => 
           detailImageTypes[index] === 'new' && file && file instanceof File
         );
         const existingIds = detailImageIds.filter((id, index) => 
           detailImageTypes[index] === 'existing' && id && id !== ''
         );
        
                 console.log('필터링된 newFiles:', newFiles);
         console.log('필터링된 newFiles 길이:', newFiles.length);
         console.log('필터링된 existingIds:', existingIds);
         
         // newFiles 필터링 과정 상세 디버깅
         console.log('=== newFiles 필터링 과정 ===');
         detailFiles.forEach((file, index) => {
           const type = detailImageTypes[index];
           const isFile = file && file instanceof File;
           console.log(`인덱스 ${index}: type=${type}, isFile=${isFile}, file=`, file ? file.name : 'null');
         });
       
                        if (newFiles.length > 0) {
           console.log('=== 새로 업로드할 파일들 ===');
           newFiles.forEach((file, index) => {
             console.log(`detailImages[${index}]:`, {
               name: file.name,
               type: file.type,
               size: file.size,
               isFile: file instanceof File
             });
             // 각 파일을 개별적으로 detailImages로 추가 (List<MultipartFile>에 맞춤)
             formData.append('detailImages', file);
           });
           console.log('새로 업로드된 상세 이미지들 추가됨:', newFiles.map(f => f.name));
         } else {
           console.log('새로 업로드할 상세 이미지가 없습니다.');
           // 새로 업로드할 파일이 없으면 detailImages를 추가하지 않음 (required = false)
         }
       
       if (isEdit && existingIds.length > 0) {
         console.log('기존 상세 이미지들 유지 (ID들:', existingIds + ')');
       }

      // 전송할 데이터 로그 출력
      console.log('=== 상품 등록/수정 데이터 ===');
      console.log('Request 데이터:', requestData);
      console.log('썸네일 파일:', thumbnailFile ? thumbnailFile.name : '없음');
             console.log('상세 이미지 파일들:', detailFiles ? detailFiles.filter(f => f && f.name).map(f => f.name) : []);
      
             // FormData 내용 확인
       console.log('=== FormData 내용 ===');
       const entries = Array.from(formData.entries());
       console.log('FormData entries 개수:', entries.length);
       console.log('FormData keys:', entries.map(([key]) => key));
       entries.forEach(([key, value], index) => {
         console.log(`[${index}] Key: "${key}", Type: ${typeof value}`);
         if (key === 'thumbnailImage' || key === 'detailImages') {
           if (value && typeof value === 'object' && value.name) {
             console.log(`  ${key}:`, value.name, `(${value.type}, ${value.size} bytes)`);
           } else {
             console.log(`  ${key}:`, '파일 객체 없음', value);
           }
         } else if (key === 'request') {
           console.log(`  ${key}:`, 'JSON Blob', value);
         } else {
           console.log(`  ${key}:`, value);
         }
       });

      const url = isEdit
        ? `/api/admin/products/${productId}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('=== API 요청 정보 ===');
      console.log('URL:', url);
      console.log('Method:', method);

      const res = await fetch(url, { method, body: formData });
      
      console.log('=== 응답 정보 ===');
      console.log('Status:', res.status);
      console.log('Status Text:', res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('에러 응답:', errorText);
        throw new Error('상품 저장 실패');
      }

             // 200 상태 코드는 성공 (수정 시), 201 상태 코드는 성공 (등록 시)
               if (res.status === 200 || res.status === 201) {
          console.log(`성공 응답: ${res.status} ${res.status === 200 ? 'OK' : 'Created'}`);
          setSuccessMessage(`상품이 ${isEdit ? '수정' : '등록'}되었습니다.`);
          setShowSuccessModal(true);
        } else {
          const saved = await res.json();
          console.log('성공 응답:', saved);
          setSuccessMessage(`상품이 ${isEdit ? '수정' : '등록'}되었습니다.`);
          setShowSuccessModal(true);
        }
    } catch (err) {
      console.error('=== 에러 정보 ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
              setMessagePopupText('상품 저장 중 오류가 발생했습니다.');
        setMessagePopupType('error');
        setShowMessagePopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">로딩 중…</div>;
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/admin/products');
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={successMessage}
      />

      {/* 페이지 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? '상품 수정' : '상품 등록'}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded"></div>
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">상품 관리</h3>
              <p className="text-sm text-gray-600">상품 정보를 {isEdit ? '수정' : '등록'}합니다</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>뒤로가기</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 썸네일 이미지 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">썸네일 이미지</h3>
              <p className="text-sm text-gray-600">상품을 대표하는 메인 이미지를 업로드하세요</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>파일 선택</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-600">
                {thumbnailFile ? `선택된 파일: ${thumbnailFile.name}` : 
                 thumbnailPreview ? '기존 이미지 사용 중' : '선택된 파일 없음'}
              </span>
            </div>
            
            {thumbnailPreview && (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  alt="썸네일 미리보기"
                  className="w-40 h-40 object-cover rounded-lg shadow-md border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-200"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 상품 기본 정보 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">상품 기본 정보</h3>
              <p className="text-sm text-gray-600">상품의 기본적인 정보를 입력하세요</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 상품명 */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="상품명을 입력해주세요"
              />
            </div>

            {/* 상품 설명 */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                상품 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="상품에 대한 설명을 입력해주세요..."
                required
              />
            </div>

            {/* 대륙/국가 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">대륙</label>
                <select
                  value={continent}
                  onChange={handleContinentChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                <label className="block mb-2 font-medium text-gray-700">
                  국가 <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  disabled={!continent}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
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
          </div>
        </div>

        {/* 옵션 설정 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">옵션 설정</h3>
                <p className="text-sm text-gray-600">옵션을 입력하고 날짜에 적용하세요</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>옵션 추가</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">옵션 {index + 1}</h4>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 transition-all duration-200"
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      옵션명 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={option.optionName}
                        onChange={(e) => updateOption(index, 'optionName', e.target.value)}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="옵션명을 입력하세요"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => applyOptionToDates(index, 'optionName')}
                        disabled={startDates.length === 0}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                      >
                        적용하기
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      재고 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={option.stock}
                        onChange={(e) => updateOption(index, 'stock', parseInt(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => applyOptionToDates(index, 'stock')}
                        disabled={startDates.length === 0}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                      >
                        적용하기
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      정상가 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={option.price}
                        onChange={(e) => updateOption(index, 'price', e.target.value)}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="정상가"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => applyOptionToDates(index, 'price')}
                        disabled={startDates.length === 0}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                      >
                        적용하기
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">할인가</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={option.discountPrice}
                        onChange={(e) => updateOption(index, 'discountPrice', e.target.value)}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="할인가"
                      />
                      <button
                        type="button"
                        onClick={() => applyOptionToDates(index, 'discountPrice')}
                        disabled={startDates.length === 0}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                      >
                        적용하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 모두 적용하기 버튼 */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={applyAllOptionsToDates}
                disabled={startDates.length === 0}
                className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>모든 옵션 적용하기</span>
              </button>
            </div>
          </div>
        </div>

        {/* 시작일 선택 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">시작일 선택</h3>
              <p className="text-sm text-gray-600">상품의 시작 가능한 날짜를 선택하세요</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-left bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {startDates.length > 0 
                  ? `${startDates.length}개 날짜 선택됨` 
                  : '날짜를 선택해주세요'}
              </button>
              
              {showCalendar && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 min-w-[300px]">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      선택된 날짜: {startDates.length}개
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-all duration-200"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* 선택된 날짜들 표시 */}
            {startDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {startDates.map((date, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm flex items-center transition-all duration-200 cursor-pointer ${
                      selectedDateForView === date
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                    onClick={() => handleDateViewChange(date)}
                  >
                    {date}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 전파 방지
                        handleDateClick(date);
                      }}
                      className="ml-2 hover:opacity-70 text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 날짜별 옵션 표시 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">날짜별 옵션</h3>
              <p className="text-sm text-gray-600">날짜를 클릭하여 해당 날짜의 옵션을 확인하세요</p>
            </div>
          </div>
          
          {startDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              시작일을 먼저 선택해주세요.
            </div>
          ) : !selectedDateForView ? (
            <div className="text-center py-8 text-gray-500">
              위의 시작일 선택에서 날짜를 클릭하여 해당 날짜의 옵션을 확인하세요.
            </div>
          ) : (
            <div className="space-y-4">
              {/* 선택된 날짜의 옵션 표시 */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 text-lg">
                      {selectedDateForView} 옵션
                    </h4>
                  </div>
                  
                  {(() => {
                    const dateOptionsList = getOptionsForDate(selectedDateForView);
                    return dateOptionsList.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        이 날짜에 적용된 옵션이 없습니다.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dateOptionsList.map((option, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-gray-900">옵션 {index + 1}</h4>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // 임시 수정사항을 실제 dateOptions에 적용
                                    const tempOption = tempDateOptions[selectedDateForView]?.[index];
                                    if (tempOption) {
                                      setDateOptions(prev => {
                                        const newDateOptions = [...prev];
                                        const originalOptions = prev.filter(option => option.startDate === selectedDateForView);
                                        const originalOption = originalOptions[index];
                                        
                                        if (originalOption) {
                                          const globalIndex = newDateOptions.findIndex(item => 
                                            item.startDate === selectedDateForView && item.optionName === originalOption.optionName
                                          );
                                          
                                          if (globalIndex >= 0) {
                                            newDateOptions[globalIndex] = {
                                              ...newDateOptions[globalIndex],
                                              ...tempOption
                                            };
                                          }
                                        }
                                        
                                        return newDateOptions;
                                      });
                                      
                                      // 임시 수정사항 제거
                                      setTempDateOptions(prev => {
                                        const newTemp = { ...prev };
                                        if (newTemp[selectedDateForView]) {
                                          newTemp[selectedDateForView][index] = undefined;
                                          // 빈 슬롯 제거
                                          newTemp[selectedDateForView] = newTemp[selectedDateForView].filter(temp => temp !== undefined);
                                          if (newTemp[selectedDateForView].length === 0) {
                                            delete newTemp[selectedDateForView];
                                          }
                                        }
                                        return newTemp;
                                      });
                                    }
                                    
                                    setMessagePopupText('옵션이 적용되었습니다.');
                                    setMessagePopupType('success');
                                    setShowMessagePopup(true);
                                  }}
                                  className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <span>적용</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeDateOption(selectedDateForView, index)}
                                  className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>삭제</span>
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                  옵션명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={option.optionName}
                                  onChange={(e) => updateDateOption(selectedDateForView, index, 'optionName', e.target.value)}
                                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="옵션명을 입력하세요"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                  재고 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={option.stock}
                                  onChange={(e) => updateDateOption(selectedDateForView, index, 'stock', parseInt(e.target.value) || 0)}
                                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                  정상가 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={option.price}
                                  onChange={(e) => updateDateOption(selectedDateForView, index, 'price', parseInt(e.target.value) || 0)}
                                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="정상가"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">할인가</label>
                                <input
                                  type="number"
                                  value={option.discountPrice}
                                  onChange={(e) => updateDateOption(selectedDateForView, index, 'discountPrice', parseInt(e.target.value) || 0)}
                                  min="0"
                                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="할인가"
                                />
                              </div>
                            </div>
                            

                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
            </div>
          )}
        </div>

        {/* 상세 이미지 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">상세설명 이미지</h3>
              <p className="text-sm text-gray-600">상품의 상세 정보를 보여주는 이미지들을 업로드하세요</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-100 transition-all duration-200 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>파일 선택</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDetailImagesChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-600">
                {detailFiles.filter(f => f).length > 0 ? 
                  `${detailFiles.filter(f => f).length}개 파일 선택됨` : 
                  detailPreviews.length > 0 ? 
                    `${detailPreviews.length}개 이미지 사용 중` : 
                    '선택된 파일 없음'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {detailPreviews.map((url, idx) => (
                <div key={idx} className="relative inline-block group">
                  <img
                    src={url}
                    alt={`상세 이미지 ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveImageUp(idx)}
                        disabled={idx === 0}
                        className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImageDown(idx)}
                        disabled={idx === detailPreviews.length - 1}
                        className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="아래로 이동"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDetailImage(idx)}
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    {idx + 1}
                  </div>
                  {detailImageTypes[idx] === 'existing' && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                      기존
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 태그 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">태그</h3>
              <p className="text-sm text-gray-600">상품을 검색하기 쉽게 태그를 추가하세요</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-all duration-200"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-900"
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
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isEdit ? '수정중…' : '등록중…'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEdit ? '수정하기' : '등록하기'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={successMessage}
      />
      
      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messagePopupText}
        type={messagePopupType}
      />
    </div>
  );
};

export default AdminProductFormPage;
