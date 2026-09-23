import { useReducer } from "react";
import "./App.css";
import Restaurants from "./components/restaurants";
import StarredRestaurants from "./components/starredRestaurants";
import RestaurantsContext, {
  RestaurantsInitialState,
  RestaurantsReducer,
} from "./provider/restaurants";
import Categories from "./components/categories";
import CategoriesContext, {
  CategoriesInitialState,
  CategoriesReducer,
} from "./provider/categories";
import CategoriesView from "./components/categories/CategoriesView";


function App() {
  const [categoriesState, categoriesDispatch] = useReducer(
    CategoriesReducer,
    CategoriesInitialState
  );

  const [restaurantsState, restaurantsDispatch] = useReducer(
    RestaurantsReducer,
    RestaurantsInitialState
  );

  return (
    <div className="App">
      <h1>My Restaurant List</h1>
      <CategoriesContext.Provider
        value={{ state: categoriesState, dispatch: categoriesDispatch }}
      >
        <RestaurantsContext.Provider
          value={{ state: restaurantsState, dispatch: restaurantsDispatch }}
        >
          <Categories />
          <CategoriesView />
          <Restaurants />
          <StarredRestaurants />
        </RestaurantsContext.Provider>
      </CategoriesContext.Provider>
    </div>
  );
}

export default App;
