import { useContext } from "react";
import CategoriesContext from "../../provider/categories";
import RestaurantsContext from "../../provider/restaurants";
import { removeRestaurantFromCategory } from "../../api/categories";

const CategoriesView = () => {
  const {
    state: { categories },
    dispatch: categoriesDispatch,
  } = useContext(CategoriesContext);

  const {
    state: { restaurants },
  } = useContext(RestaurantsContext);

  const onUnassignRestaurant = async (categoryId, restaurantId) => {
    const updated = await removeRestaurantFromCategory(categoryId, restaurantId);

    categoriesDispatch({
      type: "UNASSIGN_RESTAURANT",
      payload: {
        categoryId: updated.categoryId,
        restaurantId: updated.restaurantId,
      },
    });
  };

  return (
    <div className="column">
      <div id="categories-view">
        <h2>Categories View</h2>

        {categories.map((category) => {
          const assignedRestaurants = restaurants.filter((r) =>
            category.restaurantIds.includes(r.id)
          );

          return (
            <div key={category.id} className="category-group">
              <h3>{category.name}</h3>

              {assignedRestaurants.length === 0 ? (
                <p>No restaurants assigned</p>
              ) : (
                <ul>
                  {assignedRestaurants.map((restaurant) => (
                    <li key={restaurant.id} className="category-restaurant">
                      {restaurant.name}
                      <button
                        className="unassign-btn"
                        onClick={() =>
                          onUnassignRestaurant(category.id, restaurant.id)
                        }
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesView;
