import * as isActive from './activityFns.js'
import * as singleSpa from 'single-spa'

singleSpa.registerApplication('my-app-main', () => SystemJS.import('my-app-main'), isActive.homePage,  { domElement: document.getElementById('nav-container') });
setTimeout(() => {
    singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.angularPage,  { domElement: document.getElementById('load-angular-pmo') });   
    // singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.homePage);
}, 500);

singleSpa.start()
