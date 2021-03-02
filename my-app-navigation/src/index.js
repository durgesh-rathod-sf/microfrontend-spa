import React from 'react';
import ReactDOM from 'react-dom';
// import './index.krem.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import singleSpaReact from 'single-spa-react';

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter,
})

export const bootstrap = [
  reactLifecycles.bootstrap,
]

export const mount = [
  reactLifecycles.mount,
]

export const unmount = [
  reactLifecycles.unmount,
]

export const unload = [
  reactLifecycles.unload,
]

function domElementGetter() {
  let el = document.getElementById("my-app-navigation-root");
  if (!el) {
    el = document.createElement('div');
    el.id = 'my-app-navigation-root';
    document.body.appendChild(el);
  }

  return el;
}

serviceWorker.unregister();
