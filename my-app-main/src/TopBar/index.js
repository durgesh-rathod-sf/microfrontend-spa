import React from "react";
import { useCss } from 'kremling'

function TopBar() {
    const scope = useCss(css);
    return(
        <header className="App-header" {...scope}>
            <p>
              Value Cockpit
          </p>
        </header>
    )
}

export default TopBar;

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
}`