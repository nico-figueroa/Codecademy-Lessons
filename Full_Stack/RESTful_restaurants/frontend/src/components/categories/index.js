import { useState, useEffect, useContext } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  assignRestaurantToCategory,
  removeRestaurantFromCategory,
} from "../../api/categories";
import CategoriesContext from "../../provider/categories";
import Category from "./Category";

const Categories = () => {
  const {
    state: { categories },
    dispatch,
  } = useContext(CategoriesContext);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const categoriesData = await getCategories();
      dispatch({ type: "LOADED_CATEGORIES", payload: categoriesData });
    }
    fetchData();
  }, [dispatch]);

  const onAddNewCategory = async (e) => {
    e.preventDefault();
    const newCategory = await createCategory(newCategoryName);
    setNewCategoryName("");
    dispatch({ type: "ADD_NEW_CATEGORY", payload: newCategory });
  };

  const onDeleteCategory = async (id) => {
    const deleted = await deleteCategory(id);
    if (!deleted) {
      alert("Deleting failed");
      return;
    }
    dispatch({ type: "DELETE_CATEGORY", payload: id });
  };

  const onUpdateCategory = async (id, newName) => {
    const updated = await updateCategory(id, newName);
    if (!updated) {
      alert("Updating failed");
      return;
    }
    dispatch({ type: "UPDATE_CATEGORY_NAME", payload: { id, newName } });
  };

  return (
    <div className="column">
      <div id="categories">
        <h2>Categories</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Category
                category={category}
                onDeleteCategory={() => onDeleteCategory(category.id)}
                onUpdateCategory={(newName) =>
                  onUpdateCategory(category.id, newName)
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <div id="add-new-category">
        <h3>Add a New Category!</h3>
        <form onSubmit={onAddNewCategory}>
          <label htmlFor="category-name">Name: </label>
          <input
            type="text"
            id="category-name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default Categories;
