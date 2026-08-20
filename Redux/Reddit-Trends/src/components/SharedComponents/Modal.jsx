export default function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div role="dialog" className="modal-content">
        {children}
      </div>
    </div>
  );
}
