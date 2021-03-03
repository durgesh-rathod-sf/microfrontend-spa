import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import {useCss} from 'kremling'
import React from "react";

function App({ history }) {
  const scope = useCss(css)
  return (
    <Router history={history}>
      <Route path="/react">
        <div className="App" {...scope}>
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

const css = `
& .App-Main {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
`
