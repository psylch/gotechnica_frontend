import { useCallback, useEffect, useRef, useState } from 'react';

const CameraPreview = ({ onCapture, onAlbumClick, disabled, variant = 'card' }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          /* some browsers require additional gestures */
        });
      }
      setReady(true);
    } catch (err) {
      setError(err.message || 'Unable to access the camera.');
    }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      startCamera();
    });
    return () => {
      cancelAnimationFrame(raf);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!ready || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
  }, [ready]);

  const handleCapture = async () => {
    if (!ready || disabled || !videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera is still warming up.');
      return;
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error('Capture failed.'));
          },
          'image/jpeg',
          0.92
        );
      });
      await onCapture(blob);
    } catch (err) {
      setError(err.message || 'Capture failed. Please try again.');
    }
  };

  const shellClass = ['camera-shell'];
  if (variant === 'fullscreen') shellClass.push('camera-shell-full');
  const screenClass = ['camera-screen'];
  if (variant === 'fullscreen') screenClass.push('camera-screen-full');

  return (
    <div className={shellClass.join(' ')}>
      <div className={screenClass.join(' ')}>
        {ready ? (
          <video ref={videoRef} autoPlay playsInline muted />
        ) : (
          <div className="camera-placeholder">Allow camera access to see the live feed.</div>
        )}
        <div className="focus-frame" aria-hidden />
        <div className={`camera-flash ${flash ? 'flash-on' : ''}`} aria-hidden />
        <div className="camera-status">
          <span>Auto</span>
          <span>Snapopedia Vision</span>
        </div>
      </div>
      {error && <p className="error-text camera-error">{error}</p>}
      <div className="camera-controls">
        <button type="button" className="album-btn" onClick={onAlbumClick} disabled={disabled}>
          Album
        </button>
        <button type="button" className="capture-btn" onClick={handleCapture} disabled={!ready || disabled} aria-label="Capture" />
        <button type="button" className="capture-btn ghost" disabled aria-hidden />
      </div>
    </div>
  );
};

export default CameraPreview;
