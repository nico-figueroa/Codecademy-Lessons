export default function NewTask({ newTask, handleChange, handleSubmit }) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-gray-50 p-5 rounded-xl shadow-sm mb-6"
    >
      <input
        name="title"
        placeholder="New task"
        value={newTask.title || ""}
        onChange={handleChange}
        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {newTask.title && (
        <>
          <textarea
            name="description"
            placeholder="Details..."
            value={newTask.description || ""}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Add Task
          </button>
        </>
      )}
    </form>
  );
}
