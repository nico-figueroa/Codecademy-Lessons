import { useState, useEffect } from "react";

const Category = ({ category, onDeleteCategory, onUpdateCategory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);

  useEffect(() => {
    if (!isEditing) {
      setName(category.name);
    }
  }, [isEditing, category.name]);

  const onSaveNameChange = async () => {
    onUpdateCategory(name);
    setIsEditing(false);
  };

  return (
    <div className="category-list">
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : (
        name
      )}
      <div className="category-buttons">
        <button
          className="edit-btn"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Cancel Edit" : "Edit"}
        </button>

        {isEditing ? (
          <button className="save-btn" onClick={onSaveNameChange}>
            Save Name
          </button>
        ) : (
          <button className="delete-btn" onClick={onDeleteCategory}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default Category;
