import React from "react";
import { useCss } from 'kremling';
import { withRouter, BrowserRouter as Router, Route } from 'react-router-dom';
import Main from './Main';
import FirstComponent from './FirstComponent';
import Navigation from './Navigation';
import TopBar from './TopBar';

function App() {
  const scope = useCss(css);
  return (
    <div {...scope}>
      <TopBar />
      <div className="wrapper">
        <Navigation />
        <div className="project-container">
          <Route path="/" exact>
            <Main />
          </Route>
          <Route path="/first-component" exact>
            <FirstComponent />
          </Route>
          <div id="load-angular-pmo"></div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(App);

const css = `
& .project-container {
  border: 1px solid black;
  flex: 1;
}

& .wrapper {
  display: flex;
}`
