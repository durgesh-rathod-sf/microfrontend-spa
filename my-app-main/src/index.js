import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import singleSpaReact from 'single-spa-react';

///////////////////////////


import { Provider } from "mobx-react";
import { BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import WebFont from 'webfontloader';
import 'bootstrap/scss/bootstrap.scss';


import stores from './stores';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import 'font-awesome/css/font-awesome.min.css';
// import './fonts/GraphikXCondensed-Black-Web.woff';
import './index.css';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


// WebFont.load({
//   // google: {
//   //   families: ['Poppins:400,700']
//   // }
//   // ,
//   custom: {
//     families: ['GraphikXCondensed'],
//     urls: ['./fonts/GraphikXCondensed-Black-Web.woff']
//   }
// });

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: () => <Provider {...stores}> <Router> <ToastContainer /> <DndProvider backend={HTML5Backend}> <App /> </DndProvider> </Router> </Provider>,
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
  let el = document.getElementById("root");
  if (!el) {
    el = document.createElement('div');
    el.id = 'root';
    document.body.appendChild(el);
  }

  return el;
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();