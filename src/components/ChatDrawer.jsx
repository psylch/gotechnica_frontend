import { useEffect, useRef, useState } from 'react';
import { chatWithCard } from '../services/api.js';
import { useAppState } from '../context/AppStateContext.jsx';

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const ChatDrawer = ({ isOpen, onClose }) => {
  const {
    state: { card, chatHistory, conversationId, imageUrl, userPreference },
    updateState,
  } = useAppState();

  const [question, setQuestion] = useState('');
  const [needAudio, setNeedAudio] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const audioRefs = useRef({});
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setPlayingId(null);
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const target = chatHistory.find((msg) => msg.role === 'assistant' && msg.autoPlay && msg.audioUrl);
    if (!target) return;
    const audioEl = audioRefs.current[target.id];
    if (!audioEl) return;
    audioEl
      .play()
      .then(() => setPlayingId(target.id))
      .catch(() => setPlayingId(null))
      .finally(() => {
        updateState((prev) => ({
          ...prev,
          chatHistory: prev.chatHistory.map((msg) => (msg.id === target.id ? { ...msg, autoPlay: false } : msg)),
        }));
      });
  }, [chatHistory, updateState]);

  if (!card) return null;

  const toggleAudio = (messageId) => {
    const target = audioRefs.current[messageId];
    if (!target) return;
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (audio && id !== messageId) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    if (playingId === messageId && !target.paused) {
      target.pause();
      setPlayingId(null);
    } else {
      target
        .play()
        .then(() => setPlayingId(messageId))
        .catch(() => setPlayingId(null));
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    setSending(true);
    setError('');
    const userMessage = {
      id: makeId(),
      role: 'user',
      content: question.trim(),
      ts: Date.now(),
    };
    updateState((prev) => ({ ...prev, chatHistory: [...prev.chatHistory, userMessage] }));
    setQuestion('');

    try {
      const payload = {
        card_context: `${card.title}\n${card.desc}`,
        question: userMessage.content,
        conversation_id: conversationId || undefined,
        user_preference: userPreference || undefined,
        image_url: imageUrl || undefined,
        need_audio: needAudio,
      };
      const response = await chatWithCard(payload);
      const assistantMessage = {
        id: makeId(),
        role: 'assistant',
        content: response.answer,
        audioUrl: response.audio_url,
        autoPlay: Boolean(response.audio_url),
        ts: Date.now(),
      };
      updateState((prev) => ({
        ...prev,
        conversationId: response.conversation_id,
        chatHistory: [...prev.chatHistory, assistantMessage],
      }));
    } catch (err) {
      setError(err.message || 'Failed to send, please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`chat-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="chat-header">
        <h2>Continue Asking</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="close">
          ✕
        </button>
      </div>
      <div className="chat-history" ref={listRef}>
        {chatHistory.length === 0 && <p className="hint">Ask the first question, e.g., “Which class does this fit?”</p>}
        {chatHistory.map((message) => (
          <div key={message.id} className={`bubble ${message.role}`}>
            <p>{message.content}</p>
            {message.audioUrl && (
              <>
                <audio
                  hidden
                  src={message.audioUrl}
                  ref={(el) => {
                    if (el) {
                      audioRefs.current[message.id] = el;
                    }
                  }}
                  onPlay={() => setPlayingId(message.id)}
                  onPause={() => playingId === message.id && setPlayingId(null)}
                  onEnded={() => playingId === message.id && setPlayingId(null)}
                >
                  Your browser does not support audio playback.
                </audio>
                <button type="button" className="secondary-btn audio-chip" onClick={() => toggleAudio(message.id)}>
                  {playingId === message.id ? 'Pause narration' : 'Play narration'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          placeholder="Type your question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
        />
        <label className="toggle">
          <input type="checkbox" checked={needAudio} onChange={(event) => setNeedAudio(event.target.checked)} />
          Need audio response
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="button" className="primary-btn" onClick={handleSend} disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </section>
  );
};

export default ChatDrawer;
