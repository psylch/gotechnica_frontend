import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ChatDrawer from '../components/ChatDrawer.jsx';
import { useAppState } from '../context/AppStateContext.jsx';

const Card = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    state: { card, imageUrl, autoPlayAudio },
    updateState,
  } = useAppState();

  const [chatOpen, setChatOpen] = useState(searchParams.get('chat') === 'open');
  const [shareStatus, setShareStatus] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!card) {
      navigate('/upload', { replace: true });
    }
  }, [card, navigate]);

  useEffect(() => {
    if (chatOpen) {
      setSearchParams({ chat: 'open' }, { replace: true });
    } else if (location.search) {
      setSearchParams({}, { replace: true });
    }
  }, [chatOpen, location.search, setSearchParams]);

  const displayImage = useMemo(() => (card?.highlighted_image_url ? card.highlighted_image_url : imageUrl), [card, imageUrl]);

  const handleShare = async () => {
    if (!card) return;
    const shareData = {
      title: card.title,
      text: card.desc,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${card.title}\n${card.desc}`);
        setShareStatus('Copied card content.');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (err) {
      setShareStatus(err.message || 'Share failed');
      setTimeout(() => setShareStatus(''), 3000);
    }
  };

  const handleDownload = () => {
    if (!displayImage) return;
    const anchor = document.createElement('a');
    anchor.href = displayImage;
    anchor.download = 'snapopedia-card.jpg';
    anchor.click();
  };

  useEffect(() => {
    if (!card?.audio_url) return;
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);
    audioEl.addEventListener('ended', handlePause);

    if (autoPlayAudio) {
      audioEl.play().catch(() => setIsPlaying(false));
      updateState((prev) => ({ ...prev, autoPlayAudio: false }));
    }

    return () => {
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
      audioEl.removeEventListener('ended', handlePause);
      audioEl.pause();
      audioEl.currentTime = 0;
    };
  }, [autoPlayAudio, card, updateState]);

  const toggleAudio = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      audioEl.play().catch(() => setIsPlaying(false));
    }
  };

  if (!card) {
    return null;
  }

  return (
    <section className="page card-page">
      <header className="page-header">
        <h1>{card.title}</h1>
        <p>{card.central_object || 'Automatically detected scene'}</p>
      </header>

      {displayImage ? (
        <div className="card-image">
          <img src={displayImage} alt={card.central_object || card.title} />
        </div>
      ) : (
        <div className="image-fallback">Highlight unavailable—using the original photo.</div>
      )}

      <article className="card-body">
        <p>{card.desc}</p>
        {card.audio_url ? (
          <>
            <audio hidden src={card.audio_url} ref={audioRef}>
              Your browser does not support audio playback.
            </audio>
            <button type="button" className="primary-btn audio-toggle" onClick={toggleAudio}>
              {isPlaying ? 'Pause narration' : 'Play narration'}
            </button>
          </>
        ) : (
          <p className="hint">Audio narration is not ready yet; feel free to read the text.</p>
        )}
      </article>

      <div className="action-row">
        <button type="button" className="secondary-btn" onClick={handleShare}>
          Share
        </button>
        <button type="button" className="secondary-btn" onClick={handleDownload} disabled={!displayImage}>
          Download
        </button>
        <button type="button" className="primary-btn" onClick={() => setChatOpen(true)}>
          Keep asking
        </button>
      </div>
      {shareStatus && <p className="hint">{shareStatus}</p>}

      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </section>
  );
};

export default Card;
