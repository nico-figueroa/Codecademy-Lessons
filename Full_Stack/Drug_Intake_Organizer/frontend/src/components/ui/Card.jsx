export default function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-200">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}
