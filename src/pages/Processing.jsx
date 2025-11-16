import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';
import { generateCard } from '../services/api.js';
import ProcessingTimeline from '../components/ProcessingTimeline.jsx';

const TIMELINE_STEPS = [
  { id: 'analysis', title: 'Image Analysis', description: 'Identify the subject, light, and background.' },
  { id: 'card', title: 'Card Drafting', description: 'Compose the title and core description.' },
  { id: 'highlight', title: 'Highlight Render', description: 'Emphasize the most important region.' },
  { id: 'audio', title: 'Audio Narration', description: 'Generate a natural spoken explanation.' },
];

const Processing = () => {
  const navigate = useNavigate();
  const {
    state: { processingPayload },
    updateState,
  } = useAppState();
  const payloadRef = useRef(processingPayload);

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(Boolean(processingPayload));

  useEffect(() => {
    if (!payloadRef.current) {
      navigate('/upload', { replace: true });
      return;
    }

    const payload = payloadRef.current;
    let mounted = true;
    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, TIMELINE_STEPS.length - 1));
    }, 1600);

    const run = async () => {
      try {
        const data = await generateCard(payload);
        if (!mounted) return;
        updateState((prev) => ({
          ...prev,
          card: data,
          conversationId: null,
          chatHistory: [],
          processingPayload: null,
        }));
        navigate('/card');
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Generation failed, please retry.');
      } finally {
        if (mounted) setIsProcessing(false);
      }
    };

    run();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate, updateState]);

  const completedCount = useMemo(() => (isProcessing ? activeStep : error ? 0 : TIMELINE_STEPS.length), [activeStep, error, isProcessing]);

  return (
    <section className="page processing-page">
      <div className="header">
        <span className="status-icon" role="img" aria-label="wand">
          ✨
        </span>
        <h1 className="status-title">Generating Your Card</h1>
        <p className="status-subtitle">Keep this tab open—we will redirect automatically once ready.</p>
      </div>

      <ProcessingTimeline steps={TIMELINE_STEPS} activeStep={activeStep} completed={completedCount} />

      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button type="button" className="secondary-btn" onClick={() => navigate('/upload')}>
            Re-upload
          </button>
        </div>
      )}
    </section>
  );
};

export default Processing;
