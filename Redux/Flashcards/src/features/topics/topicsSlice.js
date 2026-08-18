import { createSlice } from '@reduxjs/toolkit';
import { addQuiz } from '../quizzes/quizzesSlice';

const topicsInitialState = {
  topics: {}
};

const topicsSlice = createSlice({
    name: 'topics',
    initialState: topicsInitialState,
    reducers: {
      addTopic: (state, action) => {
        const newTopic = {...action.payload, 
          quizIds: [] 
        };

        state.topics[newTopic.id] = newTopic;
      },
    },
    extraReducers: (builder) => { 
      builder
        .addCase(addQuiz, (state, action) => {
          const { id, topicId } = action.payload;
          state.topics[topicId].quizIds.push(id);
      }) 
    },
    selectors: {
      selectTopics: (state) => state.topics
    }
});

export default topicsSlice.reducer;
export const { selectTopics } = topicsSlice.selectors;
export const { addTopic } = topicsSlice.actions;