import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';
import { generateCard, uploadImage } from '../services/api.js';
import CameraPreview from '../components/CameraPreview.jsx';
import ProcessingOverlay from '../components/ProcessingOverlay.jsx';

const preferenceOptions = ['Hands-on Science', 'Art Appreciation', 'Nature Watch', 'Experiment Recap'];
const STATUS_LINES = [
  'Framing your curiosity...',
  'Linking with luminous minds...',
  'Collecting whispers from the archives...',
  'Letting the model daydream about your scene...',
  'Sketching metaphors in the margin...',
  'Harmonizing facts with your preference...',
  'Polishing your learning prompt...',
  'Card crafted. Delivering now...',
];

const Upload = () => {
  const navigate = useNavigate();
  const {
    state: { imageUrl, userPreference },
    updateState,
  } = useAppState();

  const [preview, setPreview] = useState(imageUrl || '');
  const [preference, setPreference] = useState(userPreference || '');
  const [showTopicScreen, setShowTopicScreen] = useState(!userPreference);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [overlayError, setOverlayError] = useState('');
  const albumInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);


  const runUpload = async (file) => {
    setError('');
    setUploading(true);
    try {
      const response = await uploadImage(file);
      setPreview(response.url);
      updateState({ imageUrl: response.url });
      await beginGeneration(response.url);
    } catch (err) {
      setError(err.message || 'Upload failed, please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await runUpload(file);
  };

  const handleCameraCapture = async (blob) => {
    const file = new File([blob], `snapopedia-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await runUpload(file);
  };

  const startOverlay = () => {
    setOverlayError('');
    setOverlayVisible(true);
    setProgress(0);
    setStatusIndex(0);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 80) {
          return Math.min(prev + Math.random() * 12, 80);
        }
        return Math.min(prev + Math.random() * 2, 97);
      });
    }, 700);

    statusTimerRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_LINES.length);
    }, 2800);
  };

  const stopOverlayTimers = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (statusTimerRef.current) clearInterval(statusTimerRef.current);
  };

  const resetOverlay = () => {
    stopOverlayTimers();
    setOverlayVisible(false);
    setOverlayError('');
    setProgress(0);
    setStatusIndex(0);
  };

  const beginGeneration = async (targetImageUrl) => {
    if (!targetImageUrl) {
      setError('Please upload or capture a photo first.');
      return;
    }
    setProcessing(true);
    setError('');
    startOverlay();
    updateState((prev) => ({
      ...prev,
      userPreference: preference,
      processingPayload: {
        image_url: targetImageUrl,
        user_preference: preference || undefined,
      },
    }));
    const payload = {
      image_url: targetImageUrl,
      user_preference: preference || undefined,
    };
    try {
      const data = await generateCard(payload);
      stopOverlayTimers();
      setProgress(100);
      setStatusIndex(STATUS_LINES.length - 1);
      setTimeout(() => {
        updateState((prev) => ({
          ...prev,
          card: data,
          conversationId: null,
          chatHistory: [],
          processingPayload: null,
          autoPlayAudio: Boolean(data.audio_url),
        }));
        resetOverlay();
        setProcessing(false);
        navigate('/card');
      }, 600);
    } catch (err) {
      stopOverlayTimers();
      setOverlayError(err.message || 'Generation failed, please retry.');
      setProcessing(false);
    }
  };

  if (showTopicScreen) {
    return (
      <section className="page topic-page">
        <header className="page-header">
          <h1>Select your learning tone</h1>
          <p>Pick a lens so Snapopedia knows how to narrate the card.</p>
        </header>
        <div className="chip-group">
          {preferenceOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${preference === option ? 'selected' : ''}`}
              onClick={() => setPreference(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <input
          className="text-input"
          placeholder="Or describe your own, e.g. exam prep or class recap."
          value={preference}
          onChange={(event) => setPreference(event.target.value)}
        />
        <button type="button" className="primary-btn" onClick={() => setShowTopicScreen(false)} disabled={!preference.trim()}>
          Continue to camera
        </button>
        <button type="button" className="secondary-btn" onClick={() => setShowTopicScreen(false)}>
          Skip for now
        </button>
      </section>
    );
  }

  return (
    <section className="upload-page fullscreen">
      <div className="camera-hero">
        <CameraPreview
          variant="fullscreen"
          onCapture={handleCameraCapture}
          onAlbumClick={() => albumInputRef.current?.click()}
          disabled={uploading || processing}
        />
        {/* <button type="button" className="topic-pill" onClick={() => setShowTopicScreen(true)}>
          {preference ? `Lens: ${preference}` : 'Pick a learning tone'}
        </button> */}
      </div>

      <div className="control-panel">
        <input
          type="file"
          accept="image/*"
          ref={albumInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading || processing}
        />

        <div className="selected-card">
          <div className="selected-header">
            <p>Latest capture</p>
            <span>{preview ? 'Ready' : 'Waiting for input'}</span>
          </div>
          {preview ? (
            <img src={preview} alt="Selected preview" />
          ) : (
            <p className="placeholder">Tap the shutter or Album to import a picture.</p>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
        <p className="hint auto-hint">Every new capture immediately jumps into the Snapopedia pipeline.</p>
      </div>

      <ProcessingOverlay
        visible={overlayVisible}
        progress={progress}
        status={STATUS_LINES[statusIndex]}
        error={overlayError}
        onClose={resetOverlay}
      />
    </section>
  );
};

export default Upload;
