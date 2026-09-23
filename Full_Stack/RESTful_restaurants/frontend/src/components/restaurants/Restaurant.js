import { useState, useEffect, useContext } from "react";
import CategoriesContext from "../../provider/categories";
import { assignRestaurantToCategory } from "../../api/categories";

const Restaurant = ({
  restaurant,
  onDeleteRestaurant,
  onStarRestaurant,
  onUpdateRestaurant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);

  const { state: { categories }, dispatch } = useContext(CategoriesContext);

  // Find the current category of the restaurant
  const currentCategory = categories.find(cat =>
    cat.restaurantIds.includes(restaurant.id)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    currentCategory ? currentCategory.id : ""
  );

  // Update selected category ID when categories or restaurant ID change
  useEffect(() => {
    if (!isEditing) {
      setName(restaurant.name);
    }
  }, [isEditing, restaurant, restaurant.name]);

  const onSaveNameChange = async () => {
    onUpdateRestaurant(name);
    setIsEditing(false);
  };

  // Effect to keep selected category ID in sync with categories context
  useEffect(() => {
    const found = categories.find(cat =>
      cat.restaurantIds.includes(restaurant.id)
    );
    setSelectedCategoryId(found ? found.id : "");
  }, [categories, restaurant.id]);

  // Assign restaurant to a new category
  const onAssignCategory = async (categoryId) => {
    setSelectedCategoryId(categoryId);

    if (!categoryId) return;

    const updated = await assignRestaurantToCategory(categoryId, restaurant.id);

    // Update categories context
    dispatch({
      type: "ASSIGN_RESTAURANT",
      payload: {
        categoryId: updated.categoryId,
        restaurantId: updated.restaurantId
      }
    });
  };

  return (
    <div className="restaurant-list">
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : (
        name
      )}

      {/* Category label */}
      <div className="restaurant-category">
        {currentCategory ? (
          <span>Category: {currentCategory.name}</span>
        ) : (
          <span>No category assigned</span>
        )}
      </div>

      <div className="restaurant-buttons">
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
          <>
            <button className="delete-btn" onClick={onDeleteRestaurant}>
              Delete
            </button>
              <button className="star-btn" onClick={onStarRestaurant}>
              Star
            </button>
          </>
        )}

        {/* Category dropdown */}
        <select
          value={selectedCategoryId}
          onChange={(e) => onAssignCategory(e.target.value)}
        >
          <option value="">Assign category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Restaurant;
