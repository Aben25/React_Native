import React from 'react';
import { Provider } from 'react-redux';
import Main from './components/MainComponent';
import { ConfigureStore } from './components/redux/configureStore';

const store = ConfigureStore();
export default function App() {
    return (
        <Provider store={store}>
            <Main />
        </Provider>

    );
}