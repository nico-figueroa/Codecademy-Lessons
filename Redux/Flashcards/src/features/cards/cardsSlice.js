import { createSlice } from '@reduxjs/toolkit';

const cardsInitialState = {
  cards: {}
};

const cardsSlice = createSlice({
    name: 'cards',
    initialState: cardsInitialState,
    reducers: {
      addCard: (state, action) => {
        const newCard = {...action.payload};
        state.cards[newCard.id] = newCard;
      } 
    },
    selectors: {
      selectCardsById: (state, id) => state.cards[id]
    }
});

export default cardsSlice.reducer;
export const { selectCardsById } = cardsSlice.selectors;
export const { addCard } = cardsSlice.actions;