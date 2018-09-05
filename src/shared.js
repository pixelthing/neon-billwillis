// INDEX.JS

import app                      from './modules/app';
import helperAnalytics          from './mixins/helper-analytics';
import helperLazyload           from './mixins/helper-lazyload';
import helperObjectFit          from './mixins/helper-objectfit';
import toggleContent   	        from './elements/toggle/toggle';
import videoFrame               from './modules/video/video';
import heroFull                 from './modules/hero-full/hero-full';

// create a shared instance.
const instance = app();

// register module not associated with dom
helperAnalytics(instance);

// register the shared modules
instance.registerModules([
    toggleContent,
    helperLazyload,
    helperObjectFit,
    videoFrame,
    heroFull
]);

export default instance;
