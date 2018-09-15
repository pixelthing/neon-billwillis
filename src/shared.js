// INDEX.JS

import app                      from './modules/app';
import helperLazyload           from './mixins/helper-lazyload';
import helperObjectFit          from './mixins/helper-objectfit';
import helperUtilities          from './mixins/helper-utilities';
//import videoFrame               from './modules/video/video';
import heroFull                 from './modules/hero-full/hero-full';

// create a shared instance.
const instance = app();
helperUtilities(true);

// register the shared modules
instance.registerModules([
    helperLazyload,
    helperObjectFit,
    //videoFrame,
    heroFull
]);

export default instance;
