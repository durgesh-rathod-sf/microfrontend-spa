import { Link } from 'react-router-dom';
import { useCss } from 'kremling'
import React from "react";

function FirstComponent() {
    const scope = useCss(css)
    return (
        <div className="App" {...scope}>
            <div className="App-Main">
                <p>
                    Welcome To My First Component
            </p>
                <Link to={`/`}>
                    Back To Main React
            </Link>
            </div>
        </div>
    );
}

export default FirstComponent;

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
