import { useContext, useState } from "react";
import {
  addNewRestaurant,
  deleteRestaurant,
  starRestaurant,
  updateRestaurantName,
} from "../../api/restaurants";
import RestaurantsContext from "../../provider/restaurants";
import { INPUT_LIMITS, validateName } from "../../utils/validation";
import Restaurant from "./Restaurant";
import {
  EmptyState,
  ErrorNotice,
  PageHeading,
  errorMessage,
  inputClassName,
  primaryButtonClassName,
} from "../shared";

const Restaurants = () => {
  const {
    state: { restaurants },
    dispatch,
  } = useContext(RestaurantsContext);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const onAddNewRestaurant = async (event) => {
    event.preventDefault();
    const result = validateName(newRestaurantName);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    setFormError("");
    setIsSaving(true);
    try {
      const restaurant = await addNewRestaurant(result.value);
      dispatch({ type: "ADD_NEW_RESTAURANT", payload: restaurant });
      setNewRestaurantName("");
    } catch (requestError) {
      setFormError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteRestaurant = async (id) => {
    setError("");
    try {
      await deleteRestaurant(id);
      dispatch({ type: "DELETE_RESTAURANT", payload: id });
      dispatch({ type: "REMOVE_STARRED_RESTAURANT_BY_RESTAURANT_ID", payload: id });
      dispatch({ type: "REMOVE_RESTAURANT_ASSIGNMENTS", payload: id });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const onStarRestaurant = async (id) => {
    setError("");
    try {
      const { data } = await starRestaurant(id);
      dispatch({ type: "STAR_RESTAURANT", payload: data });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const onUpdateRestaurant = async (id, name) => {
    const result = validateName(name);
    if (result.error) throw new Error(result.error);

    await updateRestaurantName(id, result.value);
    dispatch({
      type: "UPDATE_RESTAURANT_NAME",
      payload: { id, newName: result.value },
    });
  };

  return (
    <section aria-labelledby="restaurants-title">
      <PageHeading
        eyebrow="Your personal dining guide"
        title="Manage restaurants"
        description="Add places you love, update their names, star favorites, and organize each restaurant in a category."
      />
      <ErrorNotice message={error} />

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="min-w-0">
          <h3
            className="mb-4 text-xl font-bold text-slate-900"
            id="restaurants-title"
          >
            All restaurants{" "}
            <span className="text-slate-600">({restaurants.length})</span>
          </h3>
          {restaurants.length === 0 ? (
            <EmptyState>No restaurants yet. Add your first one.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <Restaurant
                    restaurant={restaurant}
                    onDeleteRestaurant={() => onDeleteRestaurant(restaurant.id)}
                    onStarRestaurant={() => onStarRestaurant(restaurant.id)}
                    onUpdateRestaurant={(name) =>
                      onUpdateRestaurant(restaurant.id, name)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={onAddNewRestaurant}
        >
          <h3 className="text-xl font-bold text-slate-900">Add a restaurant</h3>
          <p className="mt-1 text-sm text-slate-700">
            Start with the restaurant name. You can add it to a category later.
          </p>
          <label
            className="mt-5 block text-sm font-semibold text-slate-900"
            htmlFor="new-restaurant-name"
          >
            Restaurant name
          </label>
          <input
            className={inputClassName}
            id="new-restaurant-name"
            aria-describedby={`restaurant-name-count${
              formError ? " restaurant-name-error" : ""
            }`}
            maxLength={INPUT_LIMITS.name}
            onChange={(event) => setNewRestaurantName(event.target.value)}
            required
            type="text"
            value={newRestaurantName}
          />
          <p className="mt-1 text-right text-xs text-slate-600" id="restaurant-name-count">
            {newRestaurantName.length}/{INPUT_LIMITS.name}
          </p>
          <div className="mt-3">
            <ErrorNotice id="restaurant-name-error" message={formError} />
          </div>
          <button
            className={`${primaryButtonClassName} mt-4 w-full`}
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving…" : "Add restaurant"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Restaurants;
