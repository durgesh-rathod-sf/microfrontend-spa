import React from "react";
import { useCss } from 'kremling';
import { Link, withRouter } from 'react-router-dom';

function Navigation() {
    const scope = useCss(css);
    return (
        <div className="nav-bar" {...scope}>
              <Link to={`/`} >
                <p className="nav-item">React</p>
              </Link>
              <Link to={`/angular`} >
                <p className="nav-item">Angular</p>
              </Link>
        </div>
    );
}

export default withRouter(Navigation);

const css = `
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
