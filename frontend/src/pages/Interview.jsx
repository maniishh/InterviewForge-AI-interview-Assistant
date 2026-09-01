// frontend/src/pages/Interview.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, AlertCircle, Lightbulb, Flag
} from 'lucide-react';
import useInterview    from '../hooks/useInterview';
import Card            from '../components/ui/Card';
import Badge           from '../components/ui/Badge';
import ScoreRing       from '../components/ui/ScoreRing';
import Button          from '../components/ui/Button';
import VoiceAnswerInput from '../components/voice/VoiceAnswerInput';

const TYPE_CONFIG = {
  technical:       { label: 'Technical',     color: 'technical',     hint: 'Focus on correctness, complexity, and edge cases.' },
  behavioral:      { label: 'Behavioral',    color: 'behavioral',    hint: 'Use the STAR format: Situation, Task, Action, Result.' },
  'system-design': { label: 'System Design', color: 'system-design', hint: 'Clarify requirements, then design for scale and reliability.' },
};

const Interview = () => {
  const navigate = useNavigate();

  const {
    questions, currentIndex, currentQuestion, currentAnswer,
    currentEvaluation, isLastQuestion, answeredCount, allAnswered,
    progress, isSubmitting, isCompleting,
    submitAnswer, goToNext, goToPrev, completeInterview,
    sessionId,
  } = useInterview();

  const [submitted,   setSubmitted]   = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Redirect if no active session
  useEffect(() => {
    const saved = sessionStorage.getItem('interviewforge_session');
    if (!sessionId && !saved && questions.length === 0) {
      navigate('/setup');
    }
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTimeSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Reset submitted state when question changes
  useEffect(() => {
    setSubmitted(!!currentEvaluation);
  }, [currentIndex, currentEvaluation]);

  const formatTime = (s) => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /*
   * handleAnswer — called by VoiceAnswerInput when user confirms answer.
   * Works identically whether the answer came from voice or text input.
   * The transcript/text is passed as answerText to the backend.
   */
  const handleAnswer = async (answerText) => {
    const result = await submitAnswer(answerText);
    if (result) setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    goToNext();
  };

  if (!currentQuestion) return null;

  const typeConfig = TYPE_CONFIG[currentQuestion.type] || TYPE_CONFIG.technical;

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted font-medium">
              Question{' '}
              <span className="text-text-primary font-bold font-mono">
                {currentIndex + 1}
              </span>
              <span className="text-text-muted"> / {questions.length}</span>
            </span>
            <Badge variant={typeConfig.color}>{typeConfig.label}</Badge>
            <Badge variant="default">{currentQuestion.category}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-text-muted text-sm font-mono">
              <Clock size={14} />
              {formatTime(timeSeconds)}
            </div>
            <div className="text-sm text-text-muted">
              <span className="text-success font-medium">{answeredCount}</span>
              /{questions.length} answered
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="h-1 bg-elevated rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── QUESTION CARD ── */}
        <Card className="p-8 mb-6 animate-slide-up">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20
                            flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-accent font-mono font-bold text-sm">
                Q{currentIndex + 1}
              </span>
            </div>
            <p className="text-lg font-semibold text-text-primary leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-elevated border border-border
                          flex items-start gap-2">
            <Lightbulb size={14} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">{typeConfig.hint}</p>
          </div>
        </Card>

        {/* ── VOICE ANSWER INPUT ── */}
        <Card className="p-6 mb-6 animate-slide-up">
          <VoiceAnswerInput
            onAnswer={handleAnswer}
            isSubmitting={isSubmitting}
            questionIndex={currentIndex}
            disabled={submitted}
            initialAnswer={currentAnswer}
          />
        </Card>

        {/* ── EVALUATION PANEL ── */}
        {currentEvaluation && (
          <Card className="p-6 mb-6 border-success/20 animate-slide-up" elevated>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-success" />
              <h3 className="font-semibold text-text-primary">AI Evaluation</h3>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6 pb-6 border-b border-border">
              <ScoreRing score={currentEvaluation.technicalScore     || 0} size={90} label="Technical" />
              <ScoreRing score={currentEvaluation.communicationScore || 0} size={90} label="Communication" />
              <ScoreRing score={currentEvaluation.depthScore         || 0} size={90} label="Depth" />
              <ScoreRing score={currentEvaluation.overallScore       || 0} size={90} label="Overall" />
            </div>

            <div className="space-y-4">
              {[
                { icon: AlertCircle,  label: 'Feedback',     color: '#6C63FF', text: currentEvaluation.feedback },
                { icon: CheckCircle2, label: 'Strengths',    color: '#00D9A3', text: currentEvaluation.strengths },
                { icon: Lightbulb,    label: 'Improvements', color: '#FFB547', text: currentEvaluation.improvements },
              ].map(({ icon: Icon, label, color, text }) => text && (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                       style={{ color }}>{label}</p>
                    <p className="text-sm text-text-muted leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}

              {currentEvaluation.suggestedAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-elevated border border-border">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    💡 Ideal Answer Outline
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {currentEvaluation.suggestedAnswer}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── NAVIGATION ── */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button
            variant="secondary"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>

          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === currentIndex ? '#6C63FF'
                            : i < currentIndex  ? '#00D9A3'
                            : '#1E1E2E',
                  transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {isLastQuestion ? (
            allAnswered ? (
              <Button
                onClick={completeInterview}
                isLoading={isCompleting}
                loadingText="Finishing..."
                leftIcon={<Flag size={16} />}
                style={{ background: '#00D9A3' }}
              >
                Finish Interview
              </Button>
            ) : (
              <Button variant="secondary" disabled>
                Answer all questions first
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              disabled={!submitted}
              rightIcon={<ChevronRight size={16} />}
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;