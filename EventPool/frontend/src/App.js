import React from 'react';
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import reducers from "./reducers";
import './App.css'
import { AppRouter } from './routers/AppRouter'

export const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

export const App = () => (
    <Provider store={store}>
        <AppRouter/>
    </Provider>
);