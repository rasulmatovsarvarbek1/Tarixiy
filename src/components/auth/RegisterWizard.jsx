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

  const [errorMsg, setErrorMsg] = useState('');

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const name = formData.fullName.trim() || (formData.email.trim() ? formData.email.split('@')[0] : 'O‘quvchi');
    setFormData(prev => ({ ...prev, fullName: name }));
    setErrorMsg('');
    setStep(2);
  };

  const handleFinish = () => {
    const finalName = formData.fullName.trim() || (formData.email.trim() ? formData.email.split('@')[0] : 'O‘quvchi');
    if (onComplete) {
      onComplete({
        ...formData,
        fullName: finalName,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 min-[360px]:px-4">
      {step === 1 && (
        <div className="uiverse-signin">
          <div className="heading">Sign In</div>
          <form action="" className="form" onSubmit={handleSignInSubmit}>
            <input
              className="input"
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Ismingiz"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrorMsg('');
              }}
            />
            <input
              className="input"
              type="text"
              name="email"
              id="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrorMsg('');
              }}
            />
            <input
              className="input"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setErrorMsg('');
              }}
            />
            <span className="forgot-password">
              <a href="#" onClick={(e) => e.preventDefault()}>
                Forgot Password ?
              </a>
            </span>
            {errorMsg && <div className="signin-error">{errorMsg}</div>}
            <button className="login-button" type="submit">
              Sign In
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div key="step-2" className="uiverse-signin">
          <div className="heading">Sinf va Yo'nalish</div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 6, 7, 8].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradeLevel: grade })}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: formData.gradeLevel === grade ? '2px solid #d4af37' : '2px solid #e0d6c2',
                    background: formData.gradeLevel === grade ? '#E8B84B' : '#fffbf0',
                    color: formData.gradeLevel === grade ? '#3d3424' : '#8b7e6a',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: formData.gradeLevel === grade ? 'rgba(212, 175, 55, 0.35) 0px 8px 12px -4px' : 'none',
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
                    padding: '10px 4px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: formData.gradeLevel === grade ? '2px solid #d4af37' : '2px solid #e0d6c2',
                    background: formData.gradeLevel === grade ? '#E8B84B' : '#fffbf0',
                    color: formData.gradeLevel === grade ? '#3d3424' : '#8b7e6a',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: formData.gradeLevel === grade ? 'rgba(212, 175, 55, 0.35) 0px 8px 12px -4px' : 'none',
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
                border: formData.track === 'full_history' ? '2px solid #d4af37' : '2px solid #e0d6c2',
                background: formData.track === 'full_history' ? '#fff8e6' : '#fffbf0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                boxShadow: formData.track === 'full_history' ? 'rgba(212, 175, 55, 0.25) 0px 10px 10px -5px' : 'none',
              }}
            >
              <div style={{
                padding: '8px', borderRadius: '8px',
                background: formData.track === 'full_history' ? '#E8B84B' : '#e0d6c2',
                color: formData.track === 'full_history' ? '#3d3424' : '#8b7e6a',
              }}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3d3424' }}>Full Tarix</h4>
                  {formData.track === 'full_history' && <CheckCircle2 className="w-4 h-4" style={{ color: '#d4af37' }} />}
                </div>
                <p style={{ fontSize: '11px', color: '#8b7e6a', marginTop: '2px' }}>O'zbekiston va Jahon tarixi</p>
              </div>
            </div>

            <div
              onClick={() => setFormData({ ...formData, track: 'national_certificate' })}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                border: formData.track === 'national_certificate' ? '2px solid #d4af37' : '2px solid #e0d6c2',
                background: formData.track === 'national_certificate' ? '#fff8e6' : '#fffbf0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                boxShadow: formData.track === 'national_certificate' ? 'rgba(212, 175, 55, 0.25) 0px 10px 10px -5px' : 'none',
              }}
            >
              <div style={{
                padding: '8px', borderRadius: '8px',
                background: formData.track === 'national_certificate' ? '#E8B84B' : '#e0d6c2',
                color: formData.track === 'national_certificate' ? '#3d3424' : '#8b7e6a',
              }}>
                <Award className="w-4 h-4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3d3424' }}>Milliy Sertifikat</h4>
                  {formData.track === 'national_certificate' && <CheckCircle2 className="w-4 h-4" style={{ color: '#d4af37' }} />}
                </div>
                <p style={{ fontSize: '11px', color: '#8b7e6a', marginTop: '2px' }}>BMBA / DTM sertifikat</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                padding: '12px 16px',
                background: '#fffbf0',
                color: '#8b7e6a',
                border: '2px solid #e0d6c2',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="login-button"
              style={{ flex: 1, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>Yakunlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
