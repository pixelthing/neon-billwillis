import localComparePolyfill        from 'locale-compare-polyfill';

/**
 * @method
 */
const helperUtilities = function(runInit) {

    const init = function() {
        // only init this stuff once please!
        if (runInit) {
            detectIos();
            detectAndroid();
            detectIE();
            detectEdge();
            detectTouch();
            polyfills();
            detectCachedPage();
        }
    };

    const detectIos = function() {
        const userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof(document.querySelectorAll) != 'undefined' && !document.querySelector('html').classList.contains('ios') && /iphone|ipad|ipod/i.test(userAgentTest)) {
            window.PLATFORM_IOS = true;

            if (/iphone|ipod|ipad/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('ios');
                if (/iphone|ipod/i.test(userAgentTest)) {
                    document.querySelector('html').classList.add('iphone');
                } else if (/ipad/i.test(userAgentTest)) {
                    document.querySelector('html').classList.add('ipad');
                }
                if (document.querySelector('body')) { // testing just because of a bug in the SC5 pattern library
                    document.querySelector('body').setAttribute('ontouchstart',''); // this is an old iOS hack to get :hover and :active states working. Not needed for Android.
                }
                let safariVersMaj = /version\/([0-9]*)./.exec(userAgentTest);
                if (safariVersMaj) {
                    safariVersMaj = parseInt(safariVersMaj[1]);
                    document.querySelector('html').classList.add('ios' + safariVersMaj);
                }
                if (/CriOS/i.test(userAgentTest)) {
                    document.querySelector('html').classList.add('ios-chrome');
                }
            }
        }
    };
    
    const detectAndroid = function() {
        const userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof(document.querySelectorAll) != 'undefined' && !document.querySelector('html').classList.contains('android') && /android/i.test(userAgentTest)) {
            window.PLATFORM_ANDROID = true;
            
            if (/android/i.test(userAgentTest) && /mobile/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('android','android-mobile');
            } else if (/android/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('android','android-tablet');
            }
            // detect samsung browser variation of Chromium (it's a big enough segment that it's worth flagging)
            if (/samsungbrowser/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('samsung-browser');
            }
            // detect if this version of Android Chrome supports 100%VH as the minimum vertical space (on page load, with url bar/tabs) or maximum vertical space (after scrolling down). 
            // The behaviour changed in 56, and it has a profound effect if we're trying to guess the vertical size of the screen in CSS! This effects Samsung Browser too, as it normally lags about 8 versions behind in chromium.
            let chromeVersMaj = /chrome\/([0-9]*)./.exec(userAgentTest);
            if (chromeVersMaj) {
                chromeVersMaj = parseInt(chromeVersMaj[1]);
                if (chromeVersMaj < 56) {
                    document.querySelector('html').classList.add('android-vh-old');
                }
            // else mark that this is a non chrome browsers (probably the old webkit one or possibly Opera mini)
            } else {
                window.PLATFORM_ANDROID_PRECHROME = true;
                document.querySelector('html').classList.add('android-nochrome');
            }
        }
    };
    
    const detectIE = function() {
        const userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof(document.querySelectorAll) != 'undefined' && !document.querySelector('html').classList.contains('ie') && /trident/i.test(userAgentTest)) {
            if (/trident/i.test(userAgentTest)) {
                window.BROWSER_IE = true;
                document.querySelector('html').classList.add('ie');
                let ieVersMaj = /rv:([0-9]*)./.exec(userAgentTest);
                if (ieVersMaj) {
                    ieVersMaj = parseInt(ieVersMaj[1]);
                    document.querySelector('html').classList.add('ie' + ieVersMaj);
                }
            }
        }
    };
    
    const detectEdge = function() {
        const userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof(document.querySelectorAll) != 'undefined' && !document.querySelector('html').classList.contains('edge') && / Edge/i.test(userAgentTest)) {
            if (/edge/i.test(userAgentTest)) {
                window.BROWSER_EDGE = true;
                document.querySelector('html').classList.add('edge');
                let EdgeVersMaj = /edge\/([0-9]*)./.exec(userAgentTest);
                if (EdgeVersMaj) {
                    EdgeVersMaj = parseInt(EdgeVersMaj[1]);
                    document.querySelector('html').classList.add('edge' + EdgeVersMaj);
                }
            }
        }
    };
    
    // detect touch screens on first countact with a big squidgy finger
    const detectTouch = function(obj) {
        window.addEventListener('touchstart', function onFirstTouch() {
            document.querySelector('html').classList.add('touch');
            window.TOUCH_ENABLED = true;
            window.removeEventListener('touchstart', onFirstTouch, false);
        }, supportsPassive ? { passive: true } : false);
    };

    // Test via a getter in the options object to see if the passive property is accessed
    var supportsPassive = false;
    try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function() {
        supportsPassive = true;
        }
    });
    window.addEventListener("test", null, opts);
    } catch (e) {}

    // our own clone
    const clone = function(obj) {

        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    // array intersection method: http://stackoverflow.com/posts/1885766/revisions
    const intersect = function (a, b) {
        var d = {};
        var results = [];
        for (var i = 0; i < b.length; i++) {
            d[b[i]] = true;
        }
        for (var j = 0; j < a.length; j++) {
            if (d[a[j]])
                results.push(a[j]);
        }
        return results;
    };
    
    // from http://www.albertogasparin.it/articles/2014/04/detect-css-support-of-property-value/
    let featureTestEl = {};
    const featureTest = function ( property, value, noPrefixes ) {
        // Thanks Modernizr!
        var prop = property + ':';
        // only mess with DOM one time if we're going to use this again and again
        if (typeof featureTestEl.style === 'undefined') {
            featureTestEl = document.createElement( 'test' );
        }
        var featureTestStyle = featureTestEl.style;
        if( !noPrefixes ) {
            featureTestStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join( value + ';' + prop ) + value + ';';
        } else {
            featureTestStyle.cssText = prop + value;
        }    
        return featureTestStyle[ property ];
    };

    const polyfills = function() {

        // isInteger polyfill (not in IE)
        Number.isInteger = Number.isInteger || function(value) {
            return typeof value === 'number' &&
                isFinite(value) &&
                Math.floor(value) === value;
        };

        // custom event polyfill
        (function () {
            if ( typeof window.CustomEvent === "function" ) return false;
            function CustomEvent ( event, params ) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        })();

        // padLeft (polyfilling the native padStart() method)
        // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
        if (!String.prototype.padStart) {
            String.prototype.padStart = function padStart(targetLength,padString) {
                targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
                padString = String((typeof padString !== 'undefined' ? padString : ' '));
                if (this.length > targetLength) {
                    return String(this);
                }
                else {
                    targetLength = targetLength-this.length;
                    if (targetLength > padString.length) {
                        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
                    }
                    return padString.slice(0,targetLength) + String(this);
                }
            };
        }
    };

    const detectCachedPage = function() {
        //window.addEventListener( 'pageshow', function( ev ){
        //    if (window.performance && window.performance.navigation.type=='2') {
        //        alert('CACHED')
        //       console.log('CACHED!!')
        //    }
        //});
    };

    // URL LOCATION/SEARCH MANIPULATION

    const searchToHash = function() {
        let h={};
        if (window.location.search == undefined || window.location.search.length < 1) { return h;}
        let q = window.location.search.slice(1).split('&');
        for (var i = 0; i < q.length; i++) {
            let key_val = q[i].split('=');
            // replace '+' (alt space) char explicitly since decode does not
            let hkey = decodeURIComponent(key_val[0]).replace(/\+/g,' ');
            let hval = decodeURIComponent(key_val[1]).replace(/\+/g,' ');
            if (h[hkey] == undefined) {
                h[hkey] = [];
            }
            h[hkey].push(hval);
        }
        return h;
    };

    const hashToSearch = function(h) {
        let search = "?";
        for (var k in h) {
            for (var i = 0; i < h[k].length; i++) {
                search += search == "?" ? "" : "&";
                search += encodeURIComponent(k) + "=" + encodeURIComponent(h[k][i]);
            }
        }
        if (search && search.trim() === '?') {
            search = '';
        }
        return search;
    };

    const getQueryVariable = function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        //console.log('Query variable %s not found', variable);
    };

    const addQueryVariable = function (name, value) {
        const newSearchHash = hashToSearch();
        newSearchHash[decodeURIComponent(name)] = decodeURIComponent(value);
        return hashToSearch(newSearchHash);
    };

    const removeQueryVariable = function (name) {
        const newSearchHash = searchToHash();
        if (newSearchHash[name]) {
            delete newSearchHash[name];
        }
        return hashToSearch(newSearchHash);
    };

    // use an event to detect if a click event is a keyboard enter (ie, a keyboard navigation event), or a mouse click event.
    // This helps use change the UI like using keyboard highlights where appropriate.
    // returns true for keyboard events, false for mouseclick events, and optionally runs a callback if it's a keyboard event
    const keyboardClick = function(ev,callback) {

        if (ev && ev.clientX === 0 && ev.clientY === 0) {
            // act on results
            if (typeof callback === 'function') {
                callback();
            }
            return true;
        } else {
            return false;
        }
    };

    // turn a string into a hash (useful for creating DOM element IDs from a text phrase, eg, "Vasagatan 1, London" to "-9616235")
    const hashCode = function(s){
        return s.split("").reduce(function(a,b){
            a=((a<<5)-a)+b.charCodeAt(0);return a&a;
        },0);             
    };

    // purpose clear
    const capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return {
        init: init(),
        clone,
        intersect,
        featureTest,
        supportsPassive,
        getQueryVariable,
        removeQueryVariable,
        keyboardClick,
        hashCode,
        capitalizeFirstLetter
    };
};

export default helperUtilities;
