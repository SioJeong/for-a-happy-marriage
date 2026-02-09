'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const EVENT = {
  title: '우리의 결혼식에 초대합니다',
  date: '2026-05-09',
  time: '오후 2시 40분',
  time24: '14:40',
  venue: 'KU컨벤션웨딩홀',
  address: '서울특별시 광진구 아차산로36길 5',
  phone: 'Tel. 02-447-7005',
  mapSearchName: 'KU컨벤션웨딩홀',
  lat: 37.5665,
  lng: 126.978,
};

const galleryImages = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  src: `/photos/${index + 1}.jpg`,
  alt: `갤러리 이미지 ${index + 1}`,
}));

const SHARE_URL = 'https://for-a-happy-marriage.vercel.app';
const SHARE_IMAGE_URL = 'https://for-a-happy-marriage.vercel.app/photos/0.jpg';

const accountGroups = {
  groom: {
    title: '신랑측',
    accounts: [
      {
        id: 'groom',
        label: '신랑',
        bank: '신한',
        number: '110-509-212976',
        holder: '정상영',
      },
      {
        id: 'groom-father',
        label: '신랑 아버지',
        bank: '국민',
        number: '613401-04-086267',
        holder: '정진구',
      },
      {
        id: 'groom-mother',
        label: '신랑 어머니',
        bank: '새마을',
        number: '9003-2578-5927-4',
        holder: '김은주',
      },
    ],
  },
  bride: {
    title: '신부측',
    accounts: [
      {
        id: 'bride',
        label: '신부',
        bank: '카카오',
        number: '3333-11-4104453',
        holder: '이승미',
      },
      {
        id: 'bride-father',
        label: '신부 아버지',
        bank: '전북',
        number: '538-21-0011384',
        holder: '이용백',
      },
      {
        id: 'bride-mother',
        label: '신부 어머니',
        bank: '전북',
        number: '538-21-0496478',
        holder: '곽영희',
      },
    ],
  },
};

function formatEventDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    side: '신랑측',
    attendance: '참석',
    guests: '1',
    message: '',
  });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [activeAccountGroup, setActiveAccountGroup] = useState(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  const eventDateTime = useMemo(() => new Date(`${EVENT.date}T${EVENT.time24}:00`), []);
  const eventDateText = useMemo(() => formatEventDateOnly(eventDateTime), [eventDateTime]);
  const eventSummary = useMemo(() => `${eventDateText} ${EVENT.time}`, [eventDateText]);

  const isFormValid = useMemo(() => {
    const name = formState.name.trim();
    const phone = formState.phone.trim();
    const side = formState.side?.trim();
    const attendance = formState.attendance?.trim();
    const guests = Number(formState.guests);
    const isGuestsValid = Number.isFinite(guests) && guests >= 1 && guests <= 20;

    return Boolean(name && phone && side && attendance && isGuestsValid);
  }, [formState]);

  const isAnyModalOpen = Boolean(isOpen || activeAccountGroup || activeImage);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    const tryAutoPlay = async () => {
      try {
        await audio.play();
        if (!cancelled) {
          setIsPlaying(true);
        }
      } catch (error) {
        if (!cancelled) {
          setIsPlaying(false);
        }
      }
    };

    tryAutoPlay();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let handled = false;

    const handleUserGesture = async () => {
      if (handled) return;
      handled = true;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    };

    const events = ['pointerdown', 'touchstart', 'click', 'keydown'];
    events.forEach((eventName) =>
      window.addEventListener(eventName, handleUserGesture, { passive: true, once: true })
    );

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, handleUserGesture)
      );
    };
  }, []);

  useEffect(() => {
    if (!isAnyModalOpen) return;
    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const previousBodyStyles = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };
    const previousHtmlOverflow = htmlStyle.overflow;

    bodyStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';
    htmlStyle.overflow = 'hidden';

    return () => {
      bodyStyle.overflow = previousBodyStyles.overflow;
      bodyStyle.position = previousBodyStyles.position;
      bodyStyle.top = previousBodyStyles.top;
      bodyStyle.width = previousBodyStyles.width;
      htmlStyle.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const toggleBgm = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const naverNaviUrl =
    'https://map.naver.com/p/search/KU%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80';
  const tmapUrl = 'https://tmap.life/5d024f98';
  const kakaoNaviUrl = 'https://kko.to/uwh3pvXu_v';

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormState((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok !== true) {
        throw new Error('RSVP 전송 실패');
      }

      setStatus({ type: 'success', message: '참석 응답이 전송되었습니다.' });
      setFormState({
        name: '',
        phone: '',
        side: '신랑측',
        attendance: '참석',
        guests: '1',
        message: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: '전송에 실패했어요. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch (error) {
      setStatus({
        type: 'error',
        message: '복사에 실패했어요. 길게 눌러 복사해주세요.',
      });
    }
  };

  const closeAccountModal = () => {
    setActiveAccountGroup(null);
  };

  const closeRsvpModal = () => {
    setIsOpen(false);
    setIsAttendanceOpen(false);
  };

  const handleAttendanceSelect = (option) => {
    setFormState((prev) => ({
      ...prev,
      attendance: option,
    }));
    setIsAttendanceOpen(false);
  };

  const handleKakaoShare = async () => {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '정상영 & 이승미 결혼식에 초대합니다',
        description: '2026년 5월 9일 토요일 오후 2시 40분\nKU컨벤션웨딩홀',
        imageUrl: SHARE_IMAGE_URL,
        link: {
          mobileWebUrl: SHARE_URL,
          webUrl: SHARE_URL,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: SHARE_URL,
            webUrl: SHARE_URL,
          },
        },
      ],
    });
  };

  return (
    <main className="main">
      <audio ref={audioRef} src="/music/bgm.mp3" preload="metadata" autoPlay loop playsInline />
      <button
        className="bgm-control"
        type="button"
        onClick={toggleBgm}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '배경음악 일시정지' : '배경음악 재생'}
      >
        {isPlaying ? (
          <svg className="bgm-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg className="bgm-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5l11 7-11 7V5z" />
          </svg>
        )}
      </button>
      <section className="hero">
        <div className="hero-inner">
          <Image
            className="hero-image"
            src="/photos/0.jpg"
            alt="메인 이미지"
            width={4000}
            height={6000}
            priority
          />
        </div>
      </section>

      <section className="section section-center invitation-section">
        <p className="eyebrow">INVITATION</p>
        <p className="section-text">
          <span className="text-default">꿈</span>과 <span className="text-default">제철 과일</span>
          과 <span className="text-default">노래</span>
          <br />
          둘만의 다정한 세계를 만들며
          <br />
          동그랗게 살겠습니다
        </p>

        <br />
        <p className="section-text">
          귀한 발걸음으로 저희의 <span className="text-default">시작</span>을
          <br />
          함께 <span className="text-default">축복</span>해주시면 감사하겠습니다
        </p>

        <br />
        <p className="section-text family-text">
          <span className="family-grid">
            <span className="text-default family-parents">
              정진구, 김은주<span className="family-particle">의</span>
            </span>
            <span className="family-role">아들</span>
            <span className="name-highlight family-name">정상영</span>
            <span className="text-default family-parents">
              이용백, 곽영희<span className="family-particle">의</span>
            </span>
            <span className="family-role">딸</span>
            <span className="name-highlight family-name">이승미</span>
          </span>
        </p>
      </section>

      <section className="section section-center rsvp-section">
        <p className="eyebrow">RSVP</p>
        <h2 className="location-title">참석 여부 알리기</h2>
        <p className="section-text">
          참석 여부를 알려주시면
          <br />
          준비에 큰 도움이 됩니다.
        </p>
        <br />
        <button
          className="button"
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ width: '60%' }}
        >
          참석 여부 전달하기
        </button>
      </section>

      <section className="section">
        <p className="eyebrow">GALLERY</p>
        <div className="gallery-grid">
          {galleryImages.map((image) => (
            <button
              key={image.id}
              className="gallery-item"
              type="button"
              onClick={() => setActiveImage(image)}
              aria-label={`${image.alt} 확대 보기`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={4000}
                height={6000}
                sizes="33vw"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="location-section">
          <p className="location-eyebrow">LOCATION</p>
          <h2 className="location-title">오시는 길</h2>
          <div className="map-container">
            <Image
              className="map-image"
              src="/assets/route.png"
              alt="약도"
              width={738}
              height={292}
              sizes="100vw"
            />
          </div>
          <div className="location-details">
            <p className="location-event">{eventSummary}</p>
            <p className="location-venue name-highlight">{EVENT.venue}</p>
            <p className="location-address">{EVENT.address}</p>
            <p className="location-phone">{EVENT.phone}</p>
          </div>
        </div>
      </section>

      <section className="section transport-section">
        <div className="transport-card">
          <h3 className="transport-title">지하철 이용 시</h3>
          <ul className="transport-list">
            <li className="transport-item">
              <span className="transport-dot transport-dot--subway2" />
              2호선 건대입구역 5번출구 5분거리 내
            </li>
            <li className="transport-item">
              <span className="transport-dot transport-dot--subway7" />
              7호선 건대입구역 4번출구 5분거리 내
            </li>
          </ul>
        </div>

        <div className="transport-divider" aria-hidden="true" />

        <div className="transport-card">
          <h3 className="transport-title">버스 이용 시</h3>
          <ul className="transport-list">
            <li className="transport-item">건국대학교앞 또는 건대입구역 정류장 하차</li>
            <li className="transport-item">
              <span className="transport-dot transport-dot--bus-main" />
              간선버스 : 240, 721
            </li>
            <li className="transport-item">
              <span className="transport-dot transport-dot--bus-branch" />
              지선버스 : 2222, 2224, 3217, 3220, 4212
            </li>
            <li className="transport-item">
              <span className="transport-dot transport-dot--bus-town" />
              마을버스 : 광진05
            </li>
            <li />
            <li className="transport-item">광진구의회 하차</li>
            <li className="transport-item">
              <span className="transport-dot transport-dot--bus-airport" />
              공항버스 : 6013
            </li>
          </ul>
        </div>

        <div className="transport-divider" aria-hidden="true" />

        <div className="transport-card">
          <h3 className="transport-title">자차 이용 시</h3>
          <ul className="transport-list">
            <li className="transport-item">건대 수의과대학 주차장 이용 (2시간 무료)</li>
            <li className="transport-item">원하시는 앱을 선택하시면 길안내가 시작됩니다.</li>
          </ul>
        </div>
        <div className="button-row">
          <a className="button nav-button" href={naverNaviUrl}>
            네이버지도
          </a>
          <a className="button nav-button" href={tmapUrl}>
            티맵
          </a>
          <a className="button nav-button" href={kakaoNaviUrl}>
            카카오내비
          </a>
        </div>
      </section>

      <section className="section section-center">
        <p className="location-eyebrow">ACCOUNT</p>
        <h2 className="location-title">마음 전하실 곳</h2>
        <div className="account-button-row">
          <button
            className="account-button"
            type="button"
            onClick={() => setActiveAccountGroup('groom')}
          >
            신랑측
          </button>
          <button
            className="account-button"
            type="button"
            onClick={() => setActiveAccountGroup('bride')}
          >
            신부측
          </button>
        </div>
        <p className="account-desc">
          화환은 정중히 사양합니다.
          <br />
          축하의 마음만 감사히 받겠습니다.
        </p>
      </section>

      <section className="section section-center">
        <p className="eyebrow">SHARE</p>
        <h2 className="location-title">청첩장 전달하기</h2>
        <p className="section-text">
          청첩장을 간편하게 전달해보세요.
        </p>
        <br />
        <div className="share-button-row">
          <button className="share-button" type="button" onClick={handleKakaoShare}>
            카카오톡으로 전달하기
          </button>
          <button
            className="share-button"
            type="button"
            onClick={() => handleCopy(SHARE_URL, 'share-link')}
          >
            {copiedId === 'share-link' ? '복사됨' : 'URL 복사하기'}
          </button>
        </div>
      </section>

      {activeAccountGroup && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${accountGroups[activeAccountGroup].title} 계좌`}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{accountGroups[activeAccountGroup].title}</h3>
              <button className="close-button" type="button" onClick={closeAccountModal}>
                닫기
              </button>
            </div>
            <div className="account-modal-list">
              {accountGroups[activeAccountGroup].accounts.map((account) => {
                const label = `${account.bank} ${account.number} (${account.holder})`;
                return (
                  <div key={account.id} className="account-row">
                    <div>
                      <p className="info-title">{account.label}</p>
                      <p className="info-text">{label}</p>
                    </div>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => handleCopy(label, account.id)}
                    >
                      {copiedId === account.id ? '복사됨' : '복사'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h3>참석 여부 알리기</h3>
              <button className="close-button" type="button" onClick={closeRsvpModal}>
                닫기
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="field-row">
                <span className="field-title">성함</span>
                <div className="field-control">
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    required
                  />
                </div>
              </div>
              <div className="field-row">
                <span className="field-title">전화번호</span>
                <div className="field-control">
                  <input
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    inputMode="numeric"
                    maxLength={13}
                    required
                  />
                </div>
              </div>
              <div className="field-row">
                <span className="field-title">관계</span>
                <div className="field-control">
                  <div className="radio-group" role="radiogroup">
                    {['신랑측', '신부측'].map((option) => (
                      <label key={option} className="radio-option">
                        <input
                          type="radio"
                          name="side"
                          value={option}
                          checked={formState.side === option}
                          onChange={handleChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field-row">
                <span className="field-title">참석 여부</span>
                <div className="field-control">
                  <div className="select-field">
                    <button
                      className="select-trigger"
                      type="button"
                      onClick={() => setIsAttendanceOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isAttendanceOpen}
                    >
                      {formState.attendance}
                      <span className="select-arrow" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {isAttendanceOpen && (
                      <ul className="select-menu" role="listbox">
                        {['참석', '불참'].map((option) => (
                          <li key={option}>
                            <button
                              className="select-option"
                              type="button"
                              role="option"
                              aria-selected={formState.attendance === option}
                              onClick={() => handleAttendanceSelect(option)}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="field-row">
                <span className="field-title">예상 인원</span>
                <div className="field-control">
                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="guests"
                      min="1"
                      max="20"
                      value={formState.guests}
                      onChange={handleChange}
                      required
                    />
                    <span className="unit-text">명</span>
                  </div>
                </div>
              </div>
              <div className="field-row field-row--stack">
                <span className="field-title">축하 메시지</span>
                <div className="field-control">
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="빈칸도 괜찮아요 :)"
                    rows="3"
                  />
                </div>
              </div>
              {status.message && (
                <p className={`status-message ${status.type === 'error' ? 'error' : 'success'}`}>
                  {status.message}
                </p>
              )}
              <button className="button" type="submit" disabled={isSubmitting || !isFormValid}>
                {isSubmitting ? '전송 중...' : '전송하기'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeImage && (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
        >
          <div className="lightbox" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" type="button" onClick={() => setActiveImage(null)}>
              닫기
            </button>
            <Image
              className="lightbox-image"
              src={activeImage.src}
              alt={activeImage.alt}
              width={4000}
              height={6000}
              sizes="(min-width: 768px) 520px, 92vw"
            />
          </div>
        </div>
      )}
    </main>
  );
}
