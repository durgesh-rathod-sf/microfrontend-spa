import * as isActive from './activityFns.js'
import * as singleSpa from 'single-spa'

singleSpa.registerApplication('my-app-navigation', () => SystemJS.import('my-app-navigation'), isActive.homePage, { domElement: document.getElementById('nav-container') });
setTimeout(() => {
    singleSpa.registerApplication('my-app-main', () => SystemJS.import('my-app-main'), isActive.reactPage,  { domElement: document.getElementById('load-valuecockpit-reactapp') });
    singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.angularPage,  { domElement: document.getElementById('load-angular-pmo') });   
    // singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.homePage);
}, 500);

singleSpa.start()
