import { useContext, useState } from "react";
import { removeRestaurantFromCategory } from "../../api/categories";
import CategoriesContext from "../../provider/categories";
import RestaurantsContext from "../../provider/restaurants";
import {
  EmptyState,
  ErrorNotice,
  PageHeading,
  errorMessage,
  secondaryButtonClassName,
} from "../shared";

const CategoriesView = () => {
  const {
    state: { categories },
    dispatch: categoriesDispatch,
  } = useContext(CategoriesContext);
  const {
    state: { restaurants },
  } = useContext(RestaurantsContext);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  const onUnassignRestaurant = async (categoryId, restaurantId) => {
    setError("");
    setPendingId(restaurantId);
    try {
      await removeRestaurantFromCategory(categoryId, restaurantId);
      categoriesDispatch({
        type: "UNASSIGN_RESTAURANT",
        payload: { categoryId, restaurantId },
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPendingId("");
    }
  };

  const hasAssignedRestaurants = categories.some((category) =>
    category.restaurantIds.some((id) =>
      restaurants.some((restaurant) => restaurant.id === id)
    )
  );

  return (
    <section aria-labelledby="categories-view-title">
      <PageHeading
        eyebrow="Browse your collection"
        title="Categories view"
        description="See the restaurants in each category and remove an assignment whenever you like."
        titleId="categories-view-title"
      />
      <ErrorNotice message={error} />

      {categories.length === 0 ? (
        <EmptyState>
          There are no categories yet. Add categories from the Categories page.
        </EmptyState>
      ) : !hasAssignedRestaurants ? (
        <EmptyState>
          No restaurants are assigned to categories yet. Assign them from the
          Restaurants page.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const assignedRestaurants = restaurants.filter((restaurant) =>
              category.restaurantIds.includes(restaurant.id)
            );

            return (
              <section
                aria-labelledby={`category-${category.id}`}
                className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                key={category.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="break-words text-xl font-bold text-slate-950"
                    id={`category-${category.id}`}
                  >
                    {category.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
                    {assignedRestaurants.length}
                  </span>
                </div>

                {assignedRestaurants.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-700">
                    No restaurants assigned
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-stone-200">
                    {assignedRestaurants.map((restaurant) => (
                      <li
                        className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                        key={restaurant.id}
                      >
                        <span className="break-words font-medium text-slate-900">
                          {restaurant.name}
                        </span>
                        <button
                          className={secondaryButtonClassName}
                          aria-label={`Unassign ${restaurant.name} from ${category.name}`}
                          disabled={pendingId === restaurant.id}
                          onClick={() =>
                            onUnassignRestaurant(category.id, restaurant.id)
                          }
                          type="button"
                        >
                          {pendingId === restaurant.id
                            ? "Removing…"
                            : "Unassign"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CategoriesView;
