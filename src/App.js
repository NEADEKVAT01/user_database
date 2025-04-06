import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import List from './components/List';
import UserForm from './components/UserForm';
import "./styles/App.css";

const App = () => {
  
  return (
    <Provider store={store}>
      <div className="App">
          <List />
          <UserForm />
      </div>
    </Provider>
  );
};

export default App;
