import { useState } from "react";
import NewTask from "../Presentational/NewTask.jsx";
import TasksList from "../Presentational/TasksList.jsx";

export default function AppFunction() {
  const [newTask, setNewTask] = useState({});
  const [allTasks, setAllTasks] = useState([]);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setNewTask((prev) => ({ ...prev, id: Date.now(), [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newTask.title) return;
    setAllTasks((prev) => [newTask, ...prev]);
    setNewTask({});
  };

  const handleDelete = (taskIdToRemove) => {
    setAllTasks((prev) => prev.filter((task) => task.id !== taskIdToRemove));
  };

  return (
  <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center py-10">
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 tracking-tight">
        Tasks
      </h1>

      <NewTask
        newTask={newTask}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <TasksList allTasks={allTasks} handleDelete={handleDelete} />
    </div>
  </main>
  );

}