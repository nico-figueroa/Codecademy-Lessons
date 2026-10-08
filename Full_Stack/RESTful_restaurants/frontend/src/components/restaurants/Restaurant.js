import { useContext, useEffect, useState } from "react";
import {
  assignRestaurantToCategory,
  removeRestaurantFromCategory,
} from "../../api/categories";
import CategoriesContext from "../../provider/categories";
import RestaurantsContext from "../../provider/restaurants";
import { INPUT_LIMITS, validateName } from "../../utils/validation";
import {
  dangerButtonClassName,
  ErrorNotice,
  inputClassName,
  secondaryButtonClassName,
} from "../shared";

const Restaurant = ({
  restaurant,
  onDeleteRestaurant,
  onStarRestaurant,
  onUpdateRestaurant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const {
    state: { categories },
    dispatch: categoriesDispatch,
  } = useContext(CategoriesContext);
  const {
    state: { starredRestaurants },
  } = useContext(RestaurantsContext);

  const currentCategory = categories.find((category) =>
    category.restaurantIds.includes(restaurant.id)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    currentCategory ? currentCategory.id : ""
  );
  const isStarred = starredRestaurants.some(
    (starred) => starred.restaurantId === restaurant.id
  );

  useEffect(() => {
    if (!isEditing) setName(restaurant.name);
  }, [isEditing, restaurant.name]);

  useEffect(() => {
    setSelectedCategoryId(currentCategory ? currentCategory.id : "");
  }, [currentCategory]);

  const cancelEdit = () => {
    setName(restaurant.name);
    setError("");
    setIsEditing(false);
  };

  const saveName = async (event) => {
    event.preventDefault();
    const result = validateName(name);
    if (result.error) {
      setError(result.error);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onUpdateRestaurant(result.value);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message || "Could not update this restaurant.");
    } finally {
      setIsSaving(false);
    }
  };

  const onAssignCategory = async (categoryId) => {
    const previousCategory = currentCategory;
    setSelectedCategoryId(categoryId);
    setError("");

    try {
      if (categoryId) {
        const updated = await assignRestaurantToCategory(
          categoryId,
          restaurant.id
        );
        categoriesDispatch({
          type: "ASSIGN_RESTAURANT",
          payload: {
            categoryId: updated.categoryId,
            restaurantId: updated.restaurantId,
          },
        });
      } else if (previousCategory) {
        await removeRestaurantFromCategory(previousCategory.id, restaurant.id);
        categoriesDispatch({
          type: "UNASSIGN_RESTAURANT",
          payload: {
            categoryId: previousCategory.id,
            restaurantId: restaurant.id,
          },
        });
      }
    } catch (requestError) {
      setSelectedCategoryId(previousCategory ? previousCategory.id : "");
      setError(requestError.message || "Could not update the category.");
    }
  };

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {isEditing ? (
        <form onSubmit={saveName}>
          <label
            className="block text-sm font-semibold text-slate-900"
            htmlFor={`restaurant-name-${restaurant.id}`}
          >
            Edit {restaurant.name}
          </label>
          <input
            className={inputClassName}
            id={`restaurant-name-${restaurant.id}`}
            aria-describedby={
              error ? `restaurant-error-${restaurant.id}` : undefined
            }
            maxLength={INPUT_LIMITS.name}
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={secondaryButtonClassName} onClick={cancelEdit} type="button">
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <h4 className="break-words text-lg font-semibold text-slate-900">
                {restaurant.name}
              </h4>
              <p className="mt-1 text-sm text-slate-700">
                {currentCategory
                  ? `Category: ${currentCategory.name}`
                  : "No category assigned"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={secondaryButtonClassName}
                aria-label={`Edit ${restaurant.name}`}
                onClick={() => setIsEditing(true)}
                type="button"
              >
                Edit
              </button>
              <button
                className={dangerButtonClassName}
                aria-label={`Delete ${restaurant.name}`}
                onClick={onDeleteRestaurant}
                type="button"
              >
                Delete
              </button>
              <button
                aria-pressed={isStarred}
                aria-label={`${isStarred ? "Already starred" : "Star"} ${
                  restaurant.name
                }`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isStarred}
                onClick={onStarRestaurant}
                type="button"
              >
                {isStarred ? "Starred" : "Star"}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor={`restaurant-category-${restaurant.id}`}
            >
              Category
            </label>
            <select
              className={inputClassName}
              id={`restaurant-category-${restaurant.id}`}
              aria-describedby={
                error ? `restaurant-error-${restaurant.id}` : undefined
              }
              onChange={(event) => onAssignCategory(event.target.value)}
              value={selectedCategoryId}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="mt-3">
        <ErrorNotice
          id={`restaurant-error-${restaurant.id}`}
          message={error}
        />
      </div>
    </article>
  );
};

export default Restaurant;
