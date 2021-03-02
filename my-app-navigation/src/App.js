import logo from './logo.svg';
import './App.css';
import React from "react";
import { Link, withRouter, BrowserRouter as Router, Route } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <>
        <div className="App">
          <header className="App-header">
            <p>
              Value Cockpit
          </p>
          </header>
          <div className="nav-bar">
            <Link to={`/react`} >
              <p className="nav-item">React</p>
            </Link>
            <Link to={`/angular`} >
              <p className="nav-item">Angular</p>
            </Link>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(App);
