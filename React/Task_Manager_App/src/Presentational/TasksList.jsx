export default function TasksList({ allTasks, handleDelete }) {
  return (
    <ul className="space-y-4">
      {allTasks.map(({ title, description, id }) => (
        <li
          key={id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button
              onClick={() => handleDelete(id)}
              className="text-red-600 hover:text-red-800 font-bold text-xl"
            >
              ×
            </button>
          </div>
          {description && (
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
