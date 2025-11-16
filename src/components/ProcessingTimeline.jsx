const ProcessingTimeline = ({ steps, activeStep, completed }) => (
  <div className="timeline" aria-label="Pipeline progress">
    <div className="timeline-line" aria-hidden>
      <span
        className="timeline-line-progress"
        style={{ height: `${(Math.min(completed, steps.length - 1) / (steps.length - 1)) * 100}%` }}
      />
    </div>
    <ol>
      {steps.map((step, index) => {
        const status = index < completed ? 'completed' : index === activeStep ? 'active' : '';
        return (
          <li key={step.id} className={`timeline-item ${status}`}>
            <div className="timeline-dot">{index + 1}</div>
            <div className="timeline-content">
              <p className="timeline-title">{step.title}</p>
              <p className="timeline-desc">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

export default ProcessingTimeline;
