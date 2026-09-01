// frontend/src/components/voice/VoiceAnswerInput.jsx
import { useState, useEffect } from 'react';
import { Mic, Type, RotateCcw, Send, Edit3, Volume2 } from 'lucide-react';
import useSpeechToText  from '../../hooks/useSpeechToText';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';

// ── WAVEFORM BARS ────────────────────────────────────────────────────────────
const Waveform = ({ audioLevel, isListening }) => {
  const bars = 16;
  const phases = Array.from({ length: bars }, (_, i) =>
    Math.sin((i / bars) * Math.PI * 2) * 0.5 + 0.5
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '40px' }}>
      {phases.map((phase, i) => {
        const h = isListening
          ? Math.max(4, 4 + (audioLevel / 100) * 36 * phase)
          : 4;
        return (
          <div key={i} style={{
            width: '3px', height: `${h}px`, borderRadius: '2px',
            background: isListening
              ? `rgba(108,99,255,${0.3 + phase * 0.7})`
              : '#2A2A3D',
            transition: 'height 0.06s ease-out',
            animation: !isListening ? `breathe ${1.2 + i * 0.08}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.04}s`,
          }} />
        );
      })}
      <style>{`
        @keyframes breathe { from{height:4px} to{height:10px} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes fade-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

// ── MODE TAB TOGGLE ──────────────────────────────────────────────────────────
const ModeToggle = ({ mode, onChange }) => (
  <div style={{
    display: 'inline-flex', background: '#0A0A0F',
    border: '1px solid #1E1E2E', borderRadius: '10px', padding: '3px', gap: '2px',
  }}>
    {[
      { key: 'voice', icon: Mic,  label: 'Voice' },
      { key: 'text',  icon: Type, label: 'Text'  },
    ].map(({ key, icon: Icon, label }) => (
      <button key={key} type="button" onClick={() => onChange(key)} style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 14px', borderRadius: '7px', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer', transition: 'all 0.18s',
        border: 'none',
        background: mode === key ? '#6C63FF' : 'transparent',
        color:      mode === key ? '#ffffff' : '#6B6A7D',
        boxShadow:  mode === key ? '0 2px 8px rgba(108,99,255,0.35)' : 'none',
      }}>
        <Icon size={12} />
        {label}
      </button>
    ))}
  </div>
);

// ── SUBMIT BUTTON ────────────────────────────────────────────────────────────
const SubmitBtn = ({ disabled, onClick, loading }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={{
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '9px 20px', borderRadius: '10px', fontSize: '13px',
    fontWeight: '600', border: 'none', transition: 'all 0.18s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#1A1A24' : '#6C63FF',
    color:      disabled ? '#3D3C52' : '#ffffff',
    boxShadow:  disabled ? 'none'    : '0 0 20px rgba(108,99,255,0.3)',
  }}>
    {loading ? (
      <>
        <div style={{
          width: '13px', height: '13px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff',
          animation: 'spin 0.7s linear infinite',
        }} />
        Evaluating...
      </>
    ) : (
      <><Send size={13} /> Submit Answer</>
    )}
  </button>
);

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const VoiceAnswerInput = ({
  onAnswer,
  isSubmitting  = false,
  questionIndex = 0,
  disabled      = false,
  initialAnswer = '',
}) => {
  const [inputMode,  setInputMode]  = useState('voice');
  const [phase,      setPhase]      = useState('idle');
  // idle | listening | reviewing
  const [textAnswer, setTextAnswer] = useState(initialAnswer || '');
  const [isEditing,  setIsEditing]  = useState(false);
  const [editDraft,  setEditDraft]  = useState('');

  const {
    transcript, interimText, isListening, isSupported,
    error: speechError, startListening, stopListening,
    resetTranscript,
  } = useSpeechToText({ language: 'en-US', continuous: true });

  const {
    audioLevel, hasPermission, permError,
    requestPermission, startMonitoring, stopMonitoring,
  } = useVoiceRecorder();

  // Reset/sync on question change or initialAnswer change
  useEffect(() => {
    stopListening();
    stopMonitoring();
    resetTranscript();
    setPhase('idle');
    setTextAnswer(initialAnswer || '');
    setIsEditing(false);
    setEditDraft('');
  }, [questionIndex, initialAnswer]);

  // Sync listening → phase
  useEffect(() => {
    if (isListening) {
      setPhase('listening');
      startMonitoring();
    } else if (phase === 'listening') {
      stopMonitoring();
      setPhase(transcript ? 'reviewing' : 'idle');
    }
  }, [isListening]);

  // Fallback to text mode if speech recognition is not supported in browser
  useEffect(() => {
    if (!isSupported && inputMode === 'voice') {
      setInputMode('text');
    }
  }, [isSupported, inputMode]);

  const handleMicClick = async () => {
    if (disabled || isSubmitting) return;
    if (phase === 'listening') { stopListening(); return; }
    if (hasPermission === null) {
      const ok = await requestPermission();
      if (!ok) return;
    }
    resetTranscript();
    setIsEditing(false);
    startListening();
  };

  const handleSubmit = () => {
    const text = inputMode === 'text'
      ? textAnswer
      : isEditing ? editDraft : transcript;
    if (!text.trim() || isSubmitting || disabled) return;
    onAnswer(text.trim());
  };

  const handleReset = () => {
    stopListening();
    resetTranscript();
    setPhase('idle');
    setIsEditing(false);
    setEditDraft('');
  };

  const confirmText  = isEditing ? editDraft : transcript;
  const wordCount    = confirmText.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit    = confirmText.trim().length > 0 && !isSubmitting && !disabled;
  const error        = speechError || permError;

  return (
    <div>
      {/* Header: label + mode toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '16px',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#F0EFF8', marginBottom: '2px' }}>
            Your Answer
          </p>
          <p style={{ fontSize: '11px', color: '#6B6A7D' }}>
            {inputMode === 'voice' ? 'Speak or switch to text input' : 'Type your answer below'}
          </p>
        </div>
        <ModeToggle
          mode={inputMode}
          onChange={m => {
            setInputMode(m);
            handleReset();
          }}
        />
      </div>

      {/* Answer panel */}
      <div style={{
        background: '#111118',
        border: `1px solid ${phase === 'listening'
          ? 'rgba(108,99,255,0.35)'
          : phase === 'reviewing'
          ? 'rgba(0,217,163,0.25)'
          : '#1E1E2E'}`,
        borderRadius: '16px', padding: '20px',
        transition: 'border-color 0.3s',
        minHeight: '180px',
      }}>
        {inputMode === 'text' ? (
          /* ── TEXT MODE ── */
          <div style={{ animation: 'fade-in 0.2s ease' }}>
            <textarea
              rows={6}
              disabled={disabled || isSubmitting}
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              placeholder="Type your answer here... Be as detailed as possible."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0A0A0F', border: '1px solid #1E1E2E',
                borderRadius: '12px', padding: '14px 16px',
                color: '#F0EFF8', fontSize: '14px', lineHeight: 1.7,
                resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
                opacity: disabled ? 0.7 : 1,
                cursor: disabled ? 'not-allowed' : 'text',
              }}
              onFocus={e => {
                if (!disabled) e.target.style.borderColor = 'rgba(108,99,255,0.5)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#1E1E2E';
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: '10px'
            }}>
              <span style={{ fontSize: '11px', color: '#6B6A7D' }}>
                {textAnswer.trim().split(/\s+/).filter(Boolean).length} words
                {textAnswer.trim().split(/\s+/).filter(Boolean).length < 15 && textAnswer.trim().length > 0 && (
                  <span style={{ color: '#FFB547', marginLeft: '8px' }}>
                    ⚠ Add more detail for better evaluation
                  </span>
                )}
              </span>
              <SubmitBtn
                disabled={!textAnswer.trim() || isSubmitting || disabled}
                onClick={handleSubmit}
                loading={isSubmitting}
              />
            </div>
          </div>
        ) : phase === 'idle' ? (
          /* ── VOICE: IDLE ── */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '32px 20px', gap: '16px',
            animation: 'fade-in 0.25s ease',
          }}>
            {error && (
              <div style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(255,87,87,0.08)', border: '1px solid rgba(255,87,87,0.2)',
                fontSize: '12px', color: '#FF5757', marginBottom: '4px',
              }}>
                {error} —{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => setInputMode('text')}>
                  switch to text
                </span>
              </div>
            )}

            {/* Big mic button */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-12px', borderRadius: '50%',
                border: '1px solid rgba(108,99,255,0.15)',
                animation: 'breathe 2s ease-in-out infinite',
              }} />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={disabled || isSubmitting}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.08))',
                  border: '2px solid rgba(108,99,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', position: 'relative', zIndex: 1,
                  boxShadow: '0 0 32px rgba(108,99,255,0.15)',
                }}
                onMouseEnter={e => {
                  if (!disabled && !isSubmitting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.35), rgba(108,99,255,0.15))';
                    e.currentTarget.style.boxShadow  = '0 0 40px rgba(108,99,255,0.3)';
                    e.currentTarget.style.transform  = 'scale(1.05)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.08))';
                  e.currentTarget.style.boxShadow  = '0 0 32px rgba(108,99,255,0.15)';
                  e.currentTarget.style.transform  = 'scale(1)';
                }}
              >
                <Mic size={30} color="#6C63FF" />
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '4px' }}>
                {disabled ? 'Answer submitted' : 'Tap to speak your answer'}
              </p>
              <p style={{ fontSize: '12px', color: '#6B6A7D' }}>
                {disabled ? '' : 'Speak naturally — technical terms are recognised'}
              </p>
            </div>
          </div>
        ) : phase === 'listening' ? (
          /* ── VOICE: LISTENING ── */
          <div style={{ animation: 'fade-in 0.2s ease' }}>
            {/* Top bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: '#FF5757',
                  animation: 'pulse-dot 1s ease-in-out infinite',
                }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#FF5757',
                               letterSpacing: '0.04em' }}>
                  RECORDING
                </span>
              </div>

              <Waveform audioLevel={audioLevel} isListening />

              <button type="button" onClick={handleMicClick} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.18s',
                background: 'rgba(255,87,87,0.1)', border: '1px solid rgba(255,87,87,0.25)',
                color: '#FF5757',
              }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '2px', background: '#FF5757',
                }} />
                Stop
              </button>
            </div>

            {/* Live transcript area */}
            <div style={{
              background: '#0A0A0F', border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '12px', padding: '16px', minHeight: '100px',
              fontSize: '14px', lineHeight: 1.7, color: '#F0EFF8',
              position: 'relative',
            }}>
              {/* Listening pulse in corner */}
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#6C63FF',
                  animation: 'pulse-dot 1.5s ease-in-out infinite',
                }} />
                <span style={{ fontSize: '10px', color: '#6C63FF', fontWeight: '500' }}>
                  Listening
                </span>
              </div>

              {transcript ? (
                <span style={{ color: '#F0EFF8' }}>{transcript}</span>
              ) : (
                <span style={{ color: '#3D3C52', fontStyle: 'italic' }}>
                  Start speaking — your words appear here in real time...
                </span>
              )}
              {interimText && (
                <span style={{ color: '#6B6A7D' }}> {interimText}</span>
              )}
            </div>

            <p style={{ fontSize: '11px', color: '#6B6A7D', marginTop: '8px', textAlign: 'center' }}>
              Tip: Say "HashMap" or "O of n log n" — technical terms are recognised
            </p>
          </div>
        ) : (
          /* ── VOICE: REVIEWING ── */
          <div style={{ animation: 'fade-in 0.2s ease' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={14} color="#00D9A3" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#00D9A3' }}>
                  Transcript ready
                </span>
                <span style={{
                  fontSize: '11px', padding: '1px 8px', borderRadius: '999px',
                  background: 'rgba(0,217,163,0.1)', border: '1px solid rgba(0,217,163,0.2)',
                  color: '#00D9A3',
                }}>
                  {wordCount} words
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={disabled || isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '500',
                    background: 'transparent', border: '1px solid #1E1E2E',
                    color: '#6B6A7D', cursor: (disabled || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!disabled && !isSubmitting) e.currentTarget.style.borderColor = '#6C63FF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1E1E2E';
                  }}
                >
                  <RotateCcw size={11} /> Re-record
                </button>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => { setEditDraft(transcript); setIsEditing(true); }}
                    disabled={disabled || isSubmitting}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '500',
                      background: 'transparent', border: '1px solid #1E1E2E',
                      color: '#6B6A7D', cursor: (disabled || isSubmitting) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!disabled && !isSubmitting) e.currentTarget.style.borderColor = '#6C63FF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#1E1E2E';
                    }}
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Transcript or edit */}
            {isEditing ? (
              <textarea
                value={editDraft}
                onChange={e => setEditDraft(e.target.value)}
                rows={6}
                disabled={disabled || isSubmitting}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0A0A0F', border: '1px solid rgba(108,99,255,0.4)',
                  borderRadius: '12px', padding: '14px 16px', color: '#F0EFF8',
                  fontSize: '14px', lineHeight: 1.7, resize: 'none', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            ) : (
              <div style={{
                background: '#0A0A0F', border: '1px solid #1E1E2E',
                borderRadius: '12px', padding: '14px 16px',
                fontSize: '14px', lineHeight: 1.7, color: '#F0EFF8',
                maxHeight: '150px', overflowY: 'auto',
              }}>
                {transcript}
              </div>
            )}

            {/* Warning for short answers */}
            {wordCount < 15 && wordCount > 0 && (
              <div style={{
                marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(255,181,71,0.06)', border: '1px solid rgba(255,181,71,0.15)',
                fontSize: '11px', color: '#FFB547',
              }}>
                ⚠ Short answer — elaborate for a better evaluation score
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <SubmitBtn disabled={!canSubmit} onClick={handleSubmit} loading={isSubmitting} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAnswerInput;