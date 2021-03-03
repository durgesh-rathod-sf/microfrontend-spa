import React from "react";
import './app.krem.css';
import { Scoped } from 'kremling';
import { Link, withRouter, BrowserRouter as Router, Route } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <Scoped css={css}>
        <div className="App">
          <header className="App-header">
            <p>
              Value Cockpit
          </p>
          </header>
          <div className="wrapper">
            <div className="nav-bar">
              <Link to={`/react`} >
                <p className="nav-item">React</p>
              </Link>
              <Link to={`/angular`} >
                <p className="nav-item">Angular</p>
              </Link>
            </div>
            <div className="project-container">
              <div id="load-valuecockpit-reactapp"></div>
              <div id="load-angular-pmo"></div>
            </div>
          </div>
        </div>
      </Scoped>
    );
  }
}

export default withRouter(App);

const css = `
& .App-header {
  background-color: #282c34;
  max-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

& .nav-bar {
  background-color: #282c34;
  color: white;
  height: 700px;
  width: 200px;
}

& .nav-item {
  text-align: left;
}

& .project-container {
  border: 1px solid black;
  flex: 1;
}

& .wrapper {
  display: flex;
}`
