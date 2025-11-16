const ProcessingOverlay = ({ visible, progress, status, error, onClose }) => (
  <div className={`processing-overlay ${visible ? 'visible' : ''}`} aria-hidden={!visible}>
    <div className="processing-dialog" role="status">
      {error ? (
        <>
          <p className="dialog-title">Something went wrong</p>
          <p className="overlay-status">{error}</p>
          <button type="button" className="primary-btn" onClick={onClose}>
            Close overlay
          </button>
        </>
      ) : (
        <>
          <p className="dialog-title">Linking minds with Snapopedia</p>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="overlay-status">{status}</p>
        </>
      )}
    </div>
  </div>
);

export default ProcessingOverlay;
