import React from "react";

export const RestaurantsInitialState = {
  restaurants: [],
  starredRestaurants: [],
};

export const RestaurantsReducer = (state = RestaurantsInitialState, action) => {
  switch (action.type) {
    case "LOADED_RESTAURANTS": {
      return { ...state, restaurants: action.payload };
    }
    case "LOADED_STARRED_RESTAURANTS": {
      return { ...state, starredRestaurants: action.payload };
    }
    case "ADD_NEW_RESTAURANT": {
      return { ...state, restaurants: [...state.restaurants, action.payload] };
    }
    case "DELETE_RESTAURANT": {
      return {
        ...state,
        restaurants: state.restaurants.filter(
          (restaurant) => restaurant.id !== action.payload
        ),
      };
    }
    case "REMOVE_STARRED_RESTAURANT_BY_RESTAURANT_ID": {
      return {
        ...state,
        starredRestaurants: state.starredRestaurants.filter(
          (restaurant) => restaurant.restaurantId !== action.payload
        ),
      };
    }
    case "UPDATE_RESTAURANT_NAME": {
      return {
        ...state,
        restaurants: state.restaurants.map((restaurant) =>
          restaurant.id === action.payload.id
            ? { ...restaurant, name: action.payload.newName }
            : restaurant
        ),
      };
    }
    case "STAR_RESTAURANT": {
      if (
        state.starredRestaurants.some(
          (restaurant) =>
            restaurant.restaurantId === action.payload.restaurantId
        )
      ) {
        return state;
      }
      return {
        ...state,
        starredRestaurants: [...state.starredRestaurants, action.payload],
      };
    }
    case "UNSTAR_RESTAURANT": {
      return {
        ...state,
        starredRestaurants: state.starredRestaurants.filter(
          (restaurant) => restaurant.id !== action.payload
        ),
      };
    }
    case "UPDATE_STARRED_RESTAURANT_COMMENT": {
      return {
        ...state,
        starredRestaurants: state.starredRestaurants.map((restaurant) =>
          restaurant.id === action.payload.id
            ? { ...restaurant, comment: action.payload.newComment }
            : restaurant
        ),
      };
    }
    default:
      return state;
  }
};

const RestaurantsContext = React.createContext({
  state: RestaurantsInitialState,
  dispatch: (action) => {},
});

export default RestaurantsContext;
