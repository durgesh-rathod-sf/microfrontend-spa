import { Link } from 'react-router-dom';
import { useCss } from 'kremling';
import React from "react";

function Main() {
    const scope = useCss(css);
    return (
        <div className="App" {...scope}>
            <div className="App-Main">
                <p>
                    Welcome To React Main App
        </p>
                <Link to={`/first-component`}>
                    Render First Component
                </Link>
            </div>
        </div>
    );
}

export default Main;

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
