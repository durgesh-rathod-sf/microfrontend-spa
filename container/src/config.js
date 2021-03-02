import * as isActive from './activityFns.js'
import * as singleSpa from 'single-spa'

singleSpa.registerApplication('my-app-navigation', () => SystemJS.import('my-app-navigation'), isActive.homePage);
setTimeout(() => {
    singleSpa.registerApplication('my-app-main', () => SystemJS.import('my-app-main'), isActive.reactPage);
    singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.angularPage);
    // singleSpa.registerApplication('angular-project', () => SystemJS.import('angular-project'), isActive.homePage);
}, 500);

singleSpa.start()
