import './App.css';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import {useCss} from 'kremling'
import React from "react";

function App({ history }) {
  const scope = useCss(css)
  return (
    <Router history={history}>
      <Route path="/react" exact>
        <div className="App" {...scope}>
          <div className="App-Main">
            <p>
              Welcome To React Main App
        </p>
        <Link to={`/react/first-component`}>
        Render First Component
      </Link>
          </div>
        </div>
      </Route>
      <Route path="/react/first-component">
        <div className="App" {...scope}>
          <div className="App-Main">
            <p>
              Welcome To My First Component
            </p>
            <Link to={`/react`}>
              Back To Main React
            </Link>
          </div>
        </div>
      </Route>
    </Router>
  );
}

export default App;

const css = `
& .App-Main {
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: black;
}
`
