import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';

const Home = () => {
  const {
    state: { card },
  } = useAppState();

  const hasCard = Boolean(card);

  return (
    <section className="page home-page">
      <header className="brand-header">
        <p className="logo">Snapopedia</p>
        <p className="tagline">Start with a quick snap and get a personal learning card.</p>
      </header>

      <div className="action-cards">
        <Link className="action-card card-primary" to="/upload">
          <span className="card-icon" aria-hidden>
            📷
          </span>
          <p className="card-title">Capture or Upload</p>
          <p className="card-description">Shoot or upload a photo to trigger the full pipeline.</p>
        </Link>

        <Link
          className={`action-card ${hasCard ? '' : 'card-disabled'}`}
          to={hasCard ? '/card' : '/upload'}
          aria-disabled={!hasCard}
        >
          <span className="card-icon" aria-hidden>
            🔁
          </span>
          <p className="card-title">Resume Last Card</p>
          <p className="card-description">{hasCard ? 'Jump back into the previous card to follow up or share.' : 'No cached card yet—upload one to get started.'}</p>
        </Link>

        <Link
          className={`action-card ${hasCard ? '' : 'card-disabled'}`}
          to={hasCard ? '/card?chat=open' : '/upload'}
          aria-disabled={!hasCard}
        >
          <span className="card-icon" aria-hidden>
            💬
          </span>
          <p className="card-title">Question History</p>
          <p className="card-description">Browse the AI conversation log to review key insights.</p>
        </Link>
      </div>

      <section className="features">
        <h2 className="features-title">Snapopedia Promises</h2>
        <div className="feature-list">
          <article className="feature-item">
            <h3>Mobile-First Flow</h3>
            <p>Single-column layout with persistent bottom navigation for quick jumps.</p>
          </article>
          <article className="feature-item">
            <h3>Progressive Feedback</h3>
            <p>The processing timeline lights up step by step to reduce uncertainty.</p>
          </article>
          <article className="feature-item">
            <h3>Reusable Data</h3>
            <p>Uploaded images, cards, and chat context stay cached on the client.</p>
          </article>
        </div>
      </section>
    </section>
  );
};

export default Home;
