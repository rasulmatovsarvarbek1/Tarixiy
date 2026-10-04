import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  CheckCircle2,
} from 'lucide-react';
import './RegisterWizard.css';

export default function RegisterWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gradeLevel: 9,
    track: 'full_history',
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Foydalanuvchi nima yozsa ham yoki bo'sh qoldirsa ham kirib ketaveradi
    const inputVal = formData.email.trim();
    const derivedName = inputVal ? (inputVal.includes('@') ? inputVal.split('@')[0] : inputVal) : 'O‘quvchi';

    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || derivedName,
    }));
    setStep(2);
  };

  const handleFinish = () => {
    const inputVal = formData.email.trim();
    const finalName =
      formData.fullName.trim() ||
      (inputVal ? (inputVal.includes('@') ? inputVal.split('@')[0] : inputVal) : 'O‘quvchi');

    if (onComplete) {
      onComplete({
        ...formData,
        fullName: finalName,
      });
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-4">
      {step === 1 && (
        <div className="card">
          <input
            defaultValue=""
            className="blind-check"
            type="checkbox"
            id="blind-input"
            name="blindcheck"
            hidden
          />

          <label htmlFor="blind-input" className="blind_input">
            <span className="hide">Yashirish</span>
            <span className="show">Ko‘rsatish</span>
          </label>

          <form className="form" onSubmit={handleSubmit}>
            <div className="title">Tizimga kirish</div>

            <label className="label_input" htmlFor="email-input">
              Email yoki Login
            </label>
            <input
              spellCheck="false"
              className="input"
              type="text"
              name="email"
              id="email-input"
              placeholder="Email yoki foydalanuvchi nomi..."
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
            />

            <div className="frg_pss">
              <label className="label_input" htmlFor="password-input">
                Parol
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>
                Parolni unutdingizmi?
              </a>
            </div>
            <input
              spellCheck="false"
              className="input"
              type="text"
              name="password"
              id="password-input"
              placeholder="Parolni kiriting..."
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
            />

            <button className="submit" type="submit">
              Kirish
            </button>
          </form>

          <label htmlFor="blind-input" className="avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 64 64"
              id="monkey"
            >
              <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"></ellipse>
              <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
              <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"></ellipse>
              <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
              <g fill="#89664c">
                <path d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"></path>
                <path d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"></path>
              </g>
              <path
                d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
                fill="#e0ac7e"
              ></path>
              <g fill="#3b302a" className="monkey-eye-nose">
                <path d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"></path>
                <path d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"></path>
                <ellipse cx="40.7" cy="31.7" rx="3.5" ry="4.5" className="monkey-eye-r"></ellipse>
                <ellipse cx="23.3" cy="31.7" rx="3.5" ry="4.5" className="monkey-eye-l"></ellipse>
              </g>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 64 64"
              id="monkey-hands"
            >
              <path
                fill="#89664C"
                d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
              ></path>
              <path
                fill="#FFD6BB"
                d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8 s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
              ></path>
              <path
                fill="#89664C"
                d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
              ></path>
              <path
                fill="#FFD6BB"
                d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8 s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
              ></path>
            </svg>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="step2-card">
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: '6px' }}>
            Sinf va Yo'nalish
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
            O'zingizga mos sinf va o'rganish dasturini tanlang
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 6, 7, 8].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradeLevel: grade })}
                  style={{
                    padding: '12px 4px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: formData.gradeLevel === grade ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                    background: formData.gradeLevel === grade ? '#fef3c7' : '#f8fafc',
                    color: formData.gradeLevel === grade ? '#b45309' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {grade}-sinf
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[9, 10, 11].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradeLevel: grade })}
                  style={{
                    padding: '12px 4px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: formData.gradeLevel === grade ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                    background: formData.gradeLevel === grade ? '#fef3c7' : '#f8fafc',
                    color: formData.gradeLevel === grade ? '#b45309' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {grade}-sinf
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              onClick={() => setFormData({ ...formData, track: 'full_history' })}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                border: formData.track === 'full_history' ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                background: formData.track === 'full_history' ? '#fffbeb' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                boxShadow: formData.track === 'full_history' ? '0 4px 12px rgba(217, 119, 6, 0.15)' : 'none',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: formData.track === 'full_history' ? '#d97706' : '#f1f5f9',
                  color: formData.track === 'full_history' ? '#fff' : '#64748b',
                }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Full Tarix</h4>
                  {formData.track === 'full_history' && <CheckCircle2 className="w-4 h-4" style={{ color: '#d97706' }} />}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>O'zbekiston va Jahon tarixi</p>
              </div>
            </div>

            <div
              onClick={() => setFormData({ ...formData, track: 'national_certificate' })}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                border: formData.track === 'national_certificate' ? '2px solid #d97706' : '1.5px solid #e2e8f0',
                background: formData.track === 'national_certificate' ? '#fffbeb' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                boxShadow: formData.track === 'national_certificate' ? '0 4px 12px rgba(217, 119, 6, 0.15)' : 'none',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: formData.track === 'national_certificate' ? '#d97706' : '#f1f5f9',
                  color: formData.track === 'national_certificate' ? '#fff' : '#64748b',
                }}
              >
                <Award className="w-4 h-4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Milliy Sertifikat</h4>
                  {formData.track === 'national_certificate' && <CheckCircle2 className="w-4 h-4" style={{ color: '#d97706' }} />}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>BMBA / DTM sertifikat imtihoni</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                padding: '12px 16px',
                background: '#f8fafc',
                color: '#64748b',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleFinish}
              style={{
                flex: 1,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '46px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                borderRadius: '14px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
              }}
            >
              <span>Boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
