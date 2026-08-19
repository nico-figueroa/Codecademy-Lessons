export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-banner">
      <div id="error-message">{message}</div>
      <button id="retry-btn" className="btn btn-secondary" onClick={onRetry}>Retry</button>
    </div>
  );
}
