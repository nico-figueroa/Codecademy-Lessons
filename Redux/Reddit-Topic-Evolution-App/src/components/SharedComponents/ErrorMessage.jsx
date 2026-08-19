export default function ErrorMessage({ message, onRetry }) {
  return (
    <div>
      <div id="error-message">{message}</div>
      <button id="retry-btn" onClick={onRetry}>Retry</button>
    </div>
  );
}
