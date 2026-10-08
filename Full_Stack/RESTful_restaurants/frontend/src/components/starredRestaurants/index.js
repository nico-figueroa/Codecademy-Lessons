import { useContext, useState } from "react";
import {
  unstarRestaurant,
  updateComment,
} from "../../api/starredRestaurants";
import RestaurantsContext from "../../provider/restaurants";
import StarredRestaurant from "./StarredRestaurant";
import {
  EmptyState,
  ErrorNotice,
  PageHeading,
  errorMessage,
} from "../shared";

const StarredRestaurants = () => {
  const {
    state: { starredRestaurants },
    dispatch,
  } = useContext(RestaurantsContext);
  const [error, setError] = useState("");

  const onUnstarRestaurant = async (id) => {
    setError("");
    try {
      await unstarRestaurant(id);
      dispatch({ type: "UNSTAR_RESTAURANT", payload: id });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const onUpdateComment = async (id, newComment) => {
    setError("");
    try {
      await updateComment(id, newComment);
      dispatch({
        type: "UPDATE_STARRED_RESTAURANT_COMMENT",
        payload: { id, newComment },
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  return (
    <section aria-labelledby="starred-title">
      <PageHeading
        eyebrow="The places you love"
        title="Starred restaurants"
        description="Keep your favorites close and add a personal note to remember what made each visit special."
        titleId="starred-title"
      />
      <ErrorNotice message={error} />

      {starredRestaurants.length === 0 ? (
        <EmptyState>
          No starred restaurants yet. Star a restaurant from the Restaurants
          page to save it here.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {starredRestaurants.map((restaurant) => (
            <li className="min-w-0" key={restaurant.id}>
              <StarredRestaurant
                restaurant={restaurant}
                onUnstarRestaurant={() => onUnstarRestaurant(restaurant.id)}
                onUpdateComment={(comment) =>
                  onUpdateComment(restaurant.id, comment)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StarredRestaurants;
