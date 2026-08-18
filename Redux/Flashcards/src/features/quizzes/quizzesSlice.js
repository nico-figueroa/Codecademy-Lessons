import { createSlice } from '@reduxjs/toolkit';

const quizzesInitialState = {
  quizzes: {}
};

const quizzesSlice = createSlice({
    name: 'quizzes',
    initialState: quizzesInitialState,
    reducers: {
      addQuiz: (state, action) => {
        const newQuiz = {...action.payload};
        state.quizzes[newQuiz.id] = newQuiz;
      } 
    },
    selectors: {
      selectQuizzes: (state) => state.quizzes
    }
});

export default quizzesSlice.reducer;
export const { selectQuizzes } = quizzesSlice.selectors;
export const { addQuiz } = quizzesSlice.actions;