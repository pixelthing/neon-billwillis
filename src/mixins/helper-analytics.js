import assign               from 'lodash.assign';
import helperUtilities      from 'mixins/helper-utilities';

const helperAnalytics = function(app,noInit) {

    const utilities = helperUtilities(app);

    // previously, we could specify the GA eventCategory in the the data, eg data-js-beacon-blur="Basket,open,from list page,12" or  data-js-beacon-blur="false,open"
    // hmm, well now we've hijacked the GA eventCategory (it's calculated below in getCategory(), so it's more consistent across the site), so we don't need that first argument, eg we now use data-js-beacon-blur="open,from list page,12" or  data-js-beacon-blur="open"
    // So we face a question. Do we fix all the old markup with the old datatypes, or deal with the old and new markup side-by-side.
    const datatypes = {
        clickers:     'data-js-beacon-click',
        changers:     'data-js-beacon-change',
        blurrers:     'data-js-beacon-blur',
        loaders:      'data-js-beacon-load',
        submitters:   'data-js-beacon-submit'
    };

    const defaults = {
        landingArea: 'GeLandingArea',
        landingTime: 'GeLandingTime',
    };

    const metrics = {
        RESPONSE_START_TIME     : 'metric1',
        RESPONSE_END_TIME       : 'metric2',
        DOM_LOAD_TIME           : 'metric3',
        WINDOW_LOAD_TIME        : 'metric4',
    };

    let   pageStart = 0;
    let   formStart = 0;
    let   formTime  = 0;

    const init = function() {

        // choose to run init or not by including app or not
        if (noInit) {
            return;
        }

        // don't risk registering analytics events more than once a page
        if (!app.analyticsReady) {
            app.analyticsReady = true;
            registerEvents();
            triggerLoaders();
            landingPage();
        }
        
    };

    // register the internal and shorthand events
    const registerEvents = function() {

        //app.addEventListener('beacon', function registerEventsMethod1 (data){
        //    beacon(false, data);
        //});
        //app.addEventListener('beaconLoaders', function registerEventsMethod2 (data){
        //    triggerLoaders();
        //});
        // new
        document.addEventListener('click',  () => {
            if (event.target.matches('[' + datatypes.clickers + ']')) {
                beacon();
            }
        });
        document.addEventListener('change',  () => {
            if (event.target.matches('[' + datatypes.changers + ']')) {
                beacon();
            }
        });
        document.addEventListener('blur',  () => {
            if (event.target.matches('[' + datatypes.blurrers + ']')) {
                beacon();
            }
        });
        document.addEventListener('submit',  () => {
            if (event.target.matches('[' + datatypes.submitters + ']')) {
                beacon();
            }
        });
        // any module could put this user into a populaton bucket, eg in the företag-gas-teckna area, put this user in the "engaged" bucket this session
        //app.addEventListener('addToBucket', function(ev) {
        //    addToBucket(ev[0], ev[1]);
        //});
    };

    // on landing within the site, set a cookie that records the time the user arrived, and in what section (on-idle/deferred)
    const landingPage = function() {

        const landingPageDoIt = function() {

            const cookieTimeName = defaults.landingTime;
            const cookieTimeValue = sessionStorage[cookieTimeName];
            // check to see if a cookie for this  exists
            if (!cookieTimeValue) {
                const cookieAreaName = defaults.landingArea;
                const cookieCategory= getCategory();
                sessionStorage.setItem(cookieTimeName, Date.now());
                sessionStorage.setItem(cookieAreaName, cookieCategory);
            }

        };

        // do this on idlecallback if possible
        if ('requestIdleCallback' in window) {
            requestIdleCallback(landingPageDoIt);
        // otherwise, just push it out.
        } else {
            setTimeout(landingPageDoIt,500);
        }

    };

    // on page load events triggers
    const triggerLoaders = function() {
        
        var $loaders = document.querySelectorAll('[ ' + datatypes.loaders + ']');
        $loaders.forEach(function( index, el) {
            // send the event
            beacon(false,el.getAttribute(datatypes.loaders));
            // remove the attribute so it's not triggered again
            el.removeAttr(datatypes.loaders);
        });
        
    };

    // in a GA event, the first parameter is "eventCategory", and this method attempts to normalise that so that it's 
    // relation to an area of the site is consistent and usable.
    const getCategory = function( beaconBucket, extraLabel ) {

        const $body = document.querySelector('body');
        let category = '';
        let dataLvl1 = $body.getAttribute('data-lvl1') || '';
        let dataLvl2 = $body.getAttribute('data-lvl2') || '';
        let dataLvl3 = $body.getAttribute('data-lvl3') || '';

        // is this page part of an "app", eg if you're in the Privat/El/Teckna workflow, you're inside a backend app
        // called "GeElPrivat" and that will be revealed in a datatype on the <BODY> tag.
        const appName = $body.getAttribute('data-cookie-app');
        if (appName) {
            category = appName + (beaconBucket && beaconBucket.toLowerCase() !== 'bucket' ? dataLvl3 : '' );
        // Otherwise, if we're not in an app, most pages will have other data attributes attached to the <BODY>
        } else if (dataLvl1) {
            category = dataLvl1 + dataLvl2 + dataLvl3;
        // lastly, there's a fallback in case the body has no data attributes, use the first two levels of the path
        } else {
            category = 'Ge';
            const pathArray = self.location.pathname.split('/');
            for (let i=0; i<pathArray.length; i++) {
                if (i == 0 || i > 2 || pathArray[i].indexOf('.') >= 0) {
                    continue;
                }
                category += utilities.capitalizeFirstLetter(pathArray[i]);
            }
        }

        // add any extraLabel
        if (extraLabel) {
            category += utilities.capitalizeFirstLetter(extraLabel.toLowerCase());
        }

        // add Beacon or Bucket, just so we can distinguish it from other events
        if (beaconBucket) {
            category += utilities.capitalizeFirstLetter(beaconBucket.toLowerCase());
        }

        return category;

    };

    // beacon supporting helper function
    // take a string that represents the action/label/value (not category) (eg "click,from list page,12"), 
    // and parse it to an object (eg {eventAction:"click",eventLabel:"from list page",eventValue:"12"}).
    const parseData = function(data, $el) {

        // if the data is not an object, we need to do some string parsing
        if (typeof data !== 'object') {

            // we need something - **anything** - to base the data on!
            if (!data.length) {
                console.warn( 'helperAnalytics: data sent was an empty string', $el );
                return false;
            }
            
            let dataArray = data.split(',');

            // *** the data should now be an array with between 1 and 3 items, eg [eventAction,eventLabel,eventValue]

            // eventAction is easy (also not that eventAction is mandatory, the )
            let   dataAction = dataArray[0].trim();
            if (['false','undefined','null',''].indexOf(dataAction) >= 0) {
                dataAction = false;
            }
            // eventValue is easy
            let   dataValue = ( dataArray[2] ? dataArray[2].trim() : false );
            if (['false','undefined','null',''].indexOf(dataValue) >= 0) {
                dataValue = false;
            }
            // eventLabel has some custom markup options 
            let   dataLabel = ( dataArray[1] ? dataArray[1].trim() : false );
            if (['false','undefined','null',''].indexOf(dataLabel) >= 0) {
                dataLabel = false;
            }
            // custom markup - ":value" means "report the value attribute". Works with all attribute names.
            if (dataLabel && $el && dataLabel.substring(0,1) === ':') {
                const attr = dataLabel.substring(1);
                // don't report of radio buttons that have been switched to null
                if (attr && $el.getAttribute('type') === 'radio' && $el.checked !== true) {
                    return;
                // if this is a checkbox that has been unchecked, report the value as null (not the $el.val())
                } else if (attr && $el.getAttribute('type') === 'checkbox' && $el.checked !== true) {
                    dataLabel = 'null';
                // otherwise report on the vaue of the attribute
                } else {
                    dataLabel = $el.getAttribute(dataLabel.substring(1));
                }
            }
            data = {
                'eventAction': dataAction,
                'eventLabel': dataLabel,
                'eventValue': dataValue
            };
        // if the data is passed as an object, just do some minimal error checking
        } else {
            // minimum requirement to send a GA event is the Category (which - if it's missing - we'll reset later) and Action
            if (!(data.eventAction && data.eventAction.length)) {
                console.warn( 'helperAnalytics: data sent was an object, but didn\'t have a valid eventAction', $el, data );
                return false;
            }
        }

        return data;
    };

    // send a GA event
    let   lastBeacon = null;
    let   lastBeaconTime = null;
    const beacon = function(ev, data, categoryOverride) {

        // two ways of triggering this method:
        // - via an HTML API, eg something like this on a DOM element: data-js-beacon-blur="Basket,open,from list page,12". This will have and event "ev", but no "data"
        // - via JS, eg helperAnalytics.beacon({category:'Basket',action:'open',label:'from list page',value:12}). This will have no event "ev", but *will* have the object passed in as "data"
        
        const $el = ( ev ? $(this) : false );

        // HTML API METHOD (data defined as a datatype), eg <a data-js-beacon-click="open,from list page,12" />
        if ($el && typeof data === 'undefined') {
            data = $el.getAttribute(datatypes.clickers) || 
                $el.getAttribute(datatypes.changers) || 
                $el.getAttribute(datatypes.blurrers) || 
                $el.getAttribute(datatypes.submitters);
        }
        // ERROR - NO DATA TO BEACON??
        if (typeof data === 'undefined') {
            console.warn( 'helperAnalytics: NO DATA!', ev, data );
            return;
        }
        // REFINE THE DATA INTO DATA READY TO SEND (normalise as an object)
        data = parseData(data, $el);
        
        // if the data isn't good in some way, exit now before we cause a JS error 
        // (don't panic, console error was already done in parseData())
        if (data === false) {
            return;
        }
        // GET THE CATEGORY
        const eventCategory = categoryOverride || getCategory('Beacon', data.eventCategory);

        // FINAL ASSEMBLY OF GA EVENT OBJECT
        let   dataToSend = {
            hitType         : 'event',
            eventCategory   : eventCategory,
            eventAction     : data.eventAction,
            eventLabel      : data.eventLabel,
            eventValue      : ( data.eventValue ? parseFloat(data.eventValue) : false )
        };

        // EXTRA DATA FIELDS??
        const dataKeys = Object.keys(data);
        const dataExists = Object.keys(dataToSend);
        let   dataExtra = {};
        dataKeys.map(function(key, index) {
            if (dataExists.indexOf(key) < 0) {
                dataExtra[key] = data[key];
            }
        });
        dataToSend = assign(dataExtra, dataToSend);


        // BEACON MULTI_POSTING CHECK (checke the same beacon wasn't set less that 0.5s ago)
        const dataToSendString = JSON.stringify(dataToSend);
        const now = new Date();
        if (lastBeacon === dataToSendString && now - lastBeaconTime < 500 ) {
            return;
        }
        lastBeacon = JSON.stringify(dataToSend);
        lastBeaconTime = new Date();
            
        // does ga exist in the page (don't error out)
        if (typeof ga !== 'function') {
            // console and exit.
            console.warn('helperAnalytics: NO GA!', dataToSend);
            return;
        }

        // attempt to beacon the event
        try {
            ga('send', dataToSend);
        } catch (error) {
            console.warn( 'helperAnalytics: error sending beacon', error, ev, data, dataToSend );
        }

    };

    // method so any module could put this user into a population bucket.
    // eg in the företag-gas-teckna area, put this user in the "engaged" bucket this session
    // option: the "ab" parameter can add a suffix to the bucket label, to discriminate in multi-testing environments (eg, setting an "engaged" bucket to "2018JanTest" results in a GA label of "engaged-2018JanTest")
    // option: GA label can also be communicated through a bucket.
    var addToBucket = function ( bucket, ab ) {
        const category = getCategory('Bucket');
        // check to see if a cookie for this bucket exists (remove any '-late' suffixes, or we'll be testing against the wrong indicator)
        const cookieName = category + utilities.capitalizeFirstLetter(  bucket.replace('-late','').toLowerCase() );
        const cookieValue = sessionStorage[cookieName];
        if (!cookieValue) {
            // Calc timings since landing page (in whole secs)
            const cookieTimeName  = defaults.landingTime;
            const cookieTimeValue = sessionStorage[cookieTimeName];
            let   secSince = 0;
            if (cookieTimeValue) {
                const timeNow = Date.now();
                secSince = parseInt( ( timeNow - parseInt(cookieTimeValue) )/1000 ) ;
            }
            // drop a cookie, so this user isn't entered into this bucket again this session
            sessionStorage.setItem(cookieName, secSince);
            // beacon
            beacon(false,{
                'eventAction': 'bucket',
                'eventLabel': bucket + ( ab ? '-' + ab : '' ) ,
                'eventValue': secSince
            });
        }
        // if the cookie bucket is a decision, remove any conversion buckets, because the user might be doing a second pass!
        const cookieConversionName = category + 'Conversion';
        const cookieConversion = sessionStorage[cookieConversionName];
        if (bucket.toLowerCase().indexOf('decision') >= 0 && typeof cookieConversion !== 'undefined') {
            sessionStorage.removeItem(cookieConversionName);
        }
    };

    const getDefaults = function() {
        return defaults;
    };
    
    return {
        init: init(),
        beacon,
        triggerLoaders,
        getDefaults,
        getCategory
    };

};

export default helperAnalytics;