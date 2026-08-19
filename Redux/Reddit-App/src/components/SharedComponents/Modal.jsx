export default function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div role="dialog">
      {children}
    </div>
  );
}
