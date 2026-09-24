import { useState, useEffect } from 'react';
import './App.css';
import { getTodos, createTodo, updateTodo, removeTodo } from './util/index';

const App = () => {
  const [todo, setTodo] = useState({ description: '' });
  const [todoList, setTodoList] = useState();
  const [error, setError] = useState();

  const fetchTodos = async () => {
    const res = await getTodos();
    if (res.error) {
      setError(res.error.name);
    } else {
      setTodoList(
        res.data.map(t => ({
          ...t,
          editing: false,
          tempDescription: t.description,
        }))
      );
    }
  };

  const handleDelete = async id => {
    try {
      await removeTodo(id);
      fetchTodos();
    } catch (err) {
      setError(err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError();
    const data = new FormData(e.currentTarget);

    try {
      data.set('description', todo.description);
      data.set('created_at', new Date().toISOString());

      const newTodo = await createTodo(data);

      if (newTodo.error) {
        setError(newTodo.error);
      }

      setTodo({ description: '' });
      fetchTodos();
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="App">
      <h1>To-Do List</h1>
      <p>Use the form below to add a new task.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={todo.description}
          onChange={event =>
            setTodo({ ...todo, description: event.target.value })
          }
        />
        <button type="submit">Add Todo</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ol>
        {todoList?.map(todoItem => (
          <li key={todoItem.todo_id} className="todo-item">
            {todoItem.editing ? (
              <div className="todo-edit-row">
                <input
                  className="edit-input"
                  value={todoItem.tempDescription}
                  onChange={e =>
                    setTodoList(prev =>
                      prev.map(t =>
                        t.todo_id === todoItem.todo_id
                          ? { ...t, tempDescription: e.target.value }
                          : t
                      )
                    )
                  }
                />

                <button
                  className="save-btn"
                  onClick={async () => {
                    const updated = await updateTodo(
                      todoItem.todo_id,
                      todoItem.tempDescription
                    );

                    if (!updated.error) {
                      // Exit edit mode locally BEFORE refreshing list
                      setTodoList(prev =>
                        prev.map(t =>
                          t.todo_id === todoItem.todo_id
                            ? { ...t, editing: false }
                            : t
                        )
                      );

                      fetchTodos();
                    }
                  }}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setTodoList(prev =>
                      prev.map(t =>
                        t.todo_id === todoItem.todo_id
                          ? { ...t, editing: false }
                          : t
                      )
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="todo-view-row">
                <span className="todo-text">{todoItem.description}</span>

                <button
                  className="edit-btn"
                  onClick={() =>
                    setTodoList(prev =>
                      prev.map(t =>
                        t.todo_id === todoItem.todo_id
                          ? {
                              ...t,
                              editing: true,
                              tempDescription: t.description,
                            }
                          : t
                      )
                    )
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(todoItem.todo_id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>

    </div>
  );
};

export default App;
