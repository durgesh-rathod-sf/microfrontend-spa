import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import React from "react";

function App({ history }) {
  return (
    <Router history={history}>
      <Route path="/react">
        <div className="App">
          <div className="App-Main">
            <p>
              Welcome To React App
        </p>
          </div>
        </div>
      </Route>
    </Router>
  );
}

export default App;
