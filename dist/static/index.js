require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({11:[function(require,module,exports){
'use strict';

var _shared = require('../shared/shared');

var _shared2 = _interopRequireDefault(_shared);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../shared/shared":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _app = require('./modules/app');

var _app2 = _interopRequireDefault(_app);

var _helperAnalytics = require('./mixins/helper-analytics');

var _helperAnalytics2 = _interopRequireDefault(_helperAnalytics);

var _helperLazyload = require('./mixins/helper-lazyload');

var _helperLazyload2 = _interopRequireDefault(_helperLazyload);

var _helperObjectfit = require('./mixins/helper-objectfit');

var _helperObjectfit2 = _interopRequireDefault(_helperObjectfit);

var _toggle = require('./elements/toggle/toggle');

var _toggle2 = _interopRequireDefault(_toggle);

var _video = require('./modules/video/video');

var _video2 = _interopRequireDefault(_video);

var _heroFull = require('./modules/hero-full/hero-full');

var _heroFull2 = _interopRequireDefault(_heroFull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// create a shared instance.
var instance = (0, _app2.default)();

// register module not associated with dom
// INDEX.JS

(0, _helperAnalytics2.default)(instance);

// register the shared modules
instance.registerModules([_toggle2.default, _helperLazyload2.default, _helperObjectfit2.default, _video2.default, _heroFull2.default]);

exports.default = instance;

},{"./elements/toggle/toggle":10,"./mixins/helper-analytics":13,"./mixins/helper-lazyload":15,"./mixins/helper-objectfit":16,"./modules/app":18,"./modules/hero-full/hero-full":19,"./modules/video/video":20}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _promisePolyfill = require('promise-polyfill');

var _promisePolyfill2 = _interopRequireDefault(_promisePolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * simple polyfill to swap the currentSrc of an object-fit'ed img to be the background of it's container.
 */

var selector = '[data-js-video]';
var videoFrame = function videoFrame(el, app) {

    var $el = el;
    var $poster = $el.querySelector('[data-js-video-poster]');
    var $iframe = $el.querySelector('[data-js-video-iframe]');
    var $play = $el.querySelector('[data-js-video-play]');
    var $allyOpen = $el.querySelector('[data-js-video-ally-open]');
    var $allyClose = $el.querySelector('[data-js-video-ally-close]');
    var status = false;
    var duration = 300;
    var playWidth = 0;
    var playMargin = 0;
    var posterWidth = 0;
    var posterHeight = 0;
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();
    var viewportWidthPrev = viewportWidth;

    var init = function init() {
        measure();
        setButtonTransition();
        registerEvents();
        // set up the resize event
        onResize();
        $iframe.setAttribute('aria-hidden', true);
    };

    var measure = function measure() {
        playWidth = $play.offsetWidth;
        var computedStyle = window.getComputedStyle($play);
        playMargin = parseInt(computedStyle.marginRight);
        posterWidth = $poster.offsetWidth;
        posterHeight = $poster.offsetHeight;
    };

    var setButtonTransition = function setButtonTransition() {
        var playEndWidth = 40;
        var transformScale = playEndWidth / playWidth;
        var transformX = posterWidth - playEndWidth - (posterWidth / 2 - playWidth / 2) - playEndWidth - 12;
        var transformY = posterHeight - playEndWidth - (posterHeight / 2 - playWidth / 2) - playEndWidth - 12;
        var transform = 'translateX(' + transformX + 'px) translateY(-' + transformY + 'px) scale(' + transformScale + ') rotate(90deg)';
        // store the transform
        $play.setAttribute('data-js-transform', transform);
    };

    var registerEvents = function registerEvents() {
        $poster.addEventListener('click', playStop);
        $play.addEventListener('click', playStop);
    };

    var playStop = function playStop(ev) {
        ev.preventDefault();
        if (!status) {
            play();
        } else {
            stop();
        }
    };

    var play = function play() {
        $iframe.setAttribute('aria-hidden', false);
        $poster.classList.add('Video-Poster--active');
        $poster.attr('tabindex', '-1');
        $iframe.classList.add('Video-Iframe--active');
        var src = $poster.setAttribute('data-js-video-src');
        $iframe.setAttribute('src', src);
        // add the classes that control the transition
        $play.classList.add('Video-Play--play-stop');
        // set transition going
        playToStop();
        status = true;
        // remove the transition classes once done
        setTimeout(function playTimer() {
            $play.classList.remove('Video-Play--play-stop');
            $play.attr('tabindex', '0');
            $allyOpen.style.display = 'none';
            $allyClose.style.display = 'block';
        }, duration);
    };

    var playToStop = function playToStop(instant) {
        var styleCore = 'transform: ' + $play.getAttribute('data-js-transform');
        $play.classList.add('Video-Play--active');
        $play.attr('style', styleCore);
        $allyOpen.style.display = 'block';
        $allyClose.style.display = 'none';
        $iframe.setAttribute('aria-hidden', true);
    };

    var stop = function stop() {
        $poster.classList.remove('Video-Poster--active');
        $poster.setAttribute('tabindex', '0');
        $iframe.classList.remove('Video-Iframe--active');
        $play.classList.add('Video-Play--play-stop');
        $play.classList.remove('Video-Play--active');
        $play.setAttribute('style', '');
        $play.setAttribute('tabindex', '-1');
        // when the transition is complete, remove the iFrame src.
        setTimeout(function stopTimer() {
            $iframe.src = '';
            status = false;
            // remove the transition classes once done
            $play.classList.remove('Video-Play--play-stop');
        }, duration);
    };

    var onResizeMeasurePlay = function onResizeMeasurePlay() {
        return new _promisePolyfill2.default(function measuringPlay1Promise(resolve, reject) {
            $play.setAttribute('style', 'transition:all 0ms');
            measure();
            if ($play.classList.contains('Video-Play--active')) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };

    // things need to be re-positioned when the window is resized
    var onResize = function onResize() {

        var timer = false;

        var onResizeThrottled = function onResizeThrottled() {
            onResizeMeasurePlay().then(function (wasActive) {
                setButtonTransition();
                // if the play button was active, reset it after the measurements
                if (wasActive) {
                    playToStop();
                }
                $el.classList.remove('Video--resizing');
            });
        };

        // throttle resize events
        $(window).resize(function onResizeUnThrottled(ev) {
            // Don't trigger resize on vertical resize (mobile OS' do this all the time just on scroll). 
            // Note that we try and do every kind of "soft" measurement before we attempt to recalc styles (which is costly in FPS)
            viewportWidth = ev.target.innerWidth || window.innerWidth || document.documentElement.clientWidth || $(window).width();
            if (viewportWidth != viewportWidthPrev) {
                $el.classList.add('Video--resizing');
                (0, _lodash2.default)(onResizeThrottled, 500, { 'leading': false })();
            }
            viewportWidthPrev = viewportWidth;
        });
    };

    return {
        init: init()
    };
};

videoFrame.selector = selector;

exports.default = videoFrame;

},{"lodash.debounce":4,"promise-polyfill":7}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * the control the behaviours of a single level of navigation
 */

var selector = '[data-js-hero-full]';
var heroFull = function heroFull(el, app) {

    var $el = $(el);
    var height = 0;
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();
    var viewportWidthPrev = viewportWidth;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || $(window).height();
    var viewportHeightPrev = viewportHeight;

    var init = function init() {
        // do the initial measurements of all widths
        measure();
        // do the initial measurements of all widths
        setHeight();
        // set up the resize event
        onResize();
        // click for more button
        moreButton();
        // set as ready
        $el.addClass('HeroFull--ready');
    };

    // measure the widths of all core components
    var measure = function measure() {

        // get on with the measuring
        height = el.offsetHeight;
    };

    // measure the offset of the first nav link (needs to be done after the priority plus shuffle is complete)
    var setHeight = function setHeight() {
        el.style.height = height + 'px';
    };

    var moreButton = function moreButton() {
        $('[data-js-hero-full-more]').click(function (ev) {
            ev.preventDefault();
            $("html, body").animate({ scrollTop: el.offsetHeight }, 500);
        });
    };

    // things need to be re-positioned when the window is resized
    var onResize = function onResize() {

        var timer = false;

        var scrolling = false;
        $(window).scroll(function onScroll(ev) {
            scrolling = true;
        });

        var onResizeThrottled = function onResizeThrottled(ev) {
            // Don't trigger resize on vertical resize (mobile OS' do this all the time just on scroll). 
            // Note that we try and do every kind of "soft" measurement before we attempt to recalc styles (which is costly in FPS)
            viewportWidth = ev.target.innerWidth || window.innerWidth || document.documentElement.clientWidth || $(window).width();
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || $(window).height();
            if (viewportWidth != viewportWidthPrev || viewportHeight != viewportHeightPrev && !scrolling) {
                el.setAttribute('style', '');
                measure();
                setHeight();
                $el.addClass('HeroFull--ready');
            }
            viewportWidthPrev = viewportWidth;
            viewportHeightPrev = viewportHeight;
        };

        // throttle resize events
        $(window).resize(function onResizeUnThrottled(ev) {
            if (!scrolling) {
                $el.removeClass('HeroFull--ready');
            }
            (0, _lodash2.default)(function () {
                onResizeThrottled(ev);
            }, 600)();
        });
    };

    return {
        init: init()
    };
};

heroFull.selector = selector;

exports.default = heroFull;

},{"lodash.debounce":4}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash.assign');

var _lodash2 = _interopRequireDefault(_lodash);

var _helperDebug = require('../../mixins/helper-debug');

var _helperDebug2 = _interopRequireDefault(_helperDebug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * the app is responsible for global events and
 * responsibilities.
 */

var app = function app() {

  // cache a couple of commonly used jquery items
  var debug = (0, _helperDebug2.default)();
  var analytics = null;
  var consumption = 0;

  var modalScaffold = '\n    <div class="Modal" data-js-modal>\n      <div class="Modal-Background" data-js-modal-background>\n        <div class="Modal-Content" data-js-modal-content></div>\n      </div>\n    </div>\n  ';

  // this array holds all the javascript modules
  // that should be wired when the page loads.
  var modules = [];

  /**
   * Registers and binds the modules passed.
   */
  var registerModules = function registerModules(modulesToRegister) {
    bindModules(modulesToRegister);
    modules = modules.concat(modulesToRegister);
  };

  /**
   * binds the modules by instantiating and running
   * them on each element matching the selector registered for
   * the module.
   *
   * if no modules is passed, it will rebind every module registerd.
   */
  var bindModules = function bindModules(mods) {
    mods = mods || modules;

    mods.forEach(function (module) {
      $(module.selector).each(function (i, el) {
        var $el = $(el);
        if ($el.prop(module.selector)) {
          return;
        }
        module(el, self);
        $el.prop(module.selector, true);
      });
    });
  };

  var openModal = function openModal(options) {
    $('body').append(modalScaffold);

    var $modal = $('[data-js-modal]');
    var $modalBackground = $('[data-js-modal-background]');
    var $modalContent = $('[data-js-modal-content]');
    var $close = $('[data-js-modal-close]');

    if (options && options.content) {
      $modalContent.append(options.content);
    }

    $modal.toggleClass('Modal--Active');

    // close on esc and click on close
    $close.on('click', closeModal);
    $modalBackground.on('click', closeModal);
    $modalContent.on('click', function (e) {
      return e.preventDefault();
    });

    $(document).on('keyup.modal', function (e) {
      if (e.keyCode !== 27) {
        return;
      }
      closeModal();
    });
  };

  var closeModal = function closeModal(evt) {
    if (evt) {
      evt.preventDefault();
    }
    var $modal = $('[data-js-modal]');
    $modal.toggleClass('Modal--Active');
    setTimeout(function () {
      return $modal.remove();
    }, 300);
    $(document).off('keyup.modal');
  };

  var self = (0, _lodash2.default)({
    registerModules: registerModules,
    bindModules: bindModules,
    openModal: openModal,
    closeModal: closeModal,
    debug: debug
  });

  return self;
};

exports.default = app;

},{"../../mixins/helper-debug":14,"lodash.assign":3}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module helperDebug
 */
var helperDebug = function helperDebug(app) {

  var init = function init() {
    catchConsoleLog();
    initCacheKiller();
  };

  // stop the console erroring out on platforms that don't support
  var catchConsoleLog = function catchConsoleLog() {
    // silencing the console only happens on production
    if (location.hostname.indexOf('goteborgenergi.se') < 0) {
      return;
    }
    // so we're on production - captcha the console and silence it.
    if (typeof window.console === 'undefined') {
      window.console = function () {
        var nullFunction = function nullFunction() {};
        return {
          log: nullFunction,
          warn: nullFunction,
          error: nullFunction
        };
      }();
    }
  };

  var initCacheKiller = function initCacheKiller() {
    // cache-killer url
    if (window.location.search && window.location.search.indexOf('killcache') >= 0) {
      killCache();
    }
  };

  var killCache = function killCache(selector) {

    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location = '/';
  };

  return {
    init: init(),
    killCache: killCache
  };
};

exports.default = helperDebug;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @module
 * simple polyfill to swap the currentSrc of an object-fit'ed img to be the background of it's container.
 * For speed (this can be very much a render blocking  - or at least a flash of unstyled content - script), this is all vanilla JS, no jQuery.
 */

var selector = '[data-js-poly-object-fit]';
var helperObjectFit = function helperObjectFit(el, app) {

    var wrap = el;
    var image = el.children[0];

    var init = function init() {

        // assumes a IMG or IMG/SRCSET by default, but needs a tweak if it's a PICTURE element
        if (image.tagName === 'PICTURE') {
            image = el.children[0].getElementsByTagName("IMG")[0];
            console.log("image", image);
            // if it's not an PICTURE or an IMG, exit here.
        } else if (image.tagName !== 'IMG') {
            return;
        }

        // test for object position (iOS8 responds to object-fit even though it doesn't properly support it, so easier to test for object-position, which is a more definite answer)
        if ('objectPosition' in document.documentElement.style === false) {

            // hasClass helper (non jQuery IE8+)
            var hasClass = function hasClass(className) {
                // we need to check for image !== undefined since this can be present as a attribute even without image.
                // if not image, we are in ie11, it detects even without image present, exit out. 
                if (!image) {
                    return;
                }

                if (image.classList) {
                    return image.classList.contains(className);
                } else {
                    return new RegExp('(^| )' + className + '( |$)', 'gi').test(image.className);
                }
            };

            // does the item have a lazload class and hasn't loaded? In which case wait for the load event
            if (hasClass('lazyload') && !hasClass('lazyloading') && !hasClass('lazyloaded')) {
                el.className += ' ObjectFit--lazyload';
                waitForLoad();
                // all good, the image is ready to be read and polyfilled
            } else {
                polyfill();
            }
        }
    };

    // waiting for the image src (for example) to load, before runnign the polyfill.
    // This is used for images that are lazyloading. You can't run the object-fit polyfill if we don't yet know the currentSrc file, and if it's a srcset image, we won't know which file it is until the browser makes the decision between which one to use.
    var waitForLoad = function waitForLoad() {

        // when the event is triggered (the image loads), run this
        var waitForLoadTriggered = function waitForLoadTriggered() {
            // remove the event listender now it's triggered
            image.removeEventListener('imageLoaded', waitForLoadTriggered);
            // run the polyfill
            polyfill();
        };
        // wait for the
        image.addEventListener('imageLoaded', waitForLoadTriggered);
    };

    var polyfill = function polyfill() {
        var imgUrl = image.currentSrc !== undefined ? image.currentSrc : image.src;
        if (imgUrl !== undefined) {
            wrap.style.backgroundImage = 'url(' + imgUrl + ')';
            image.className += ' ObjectFit--hidden';
            setTimeout(function () {
                el.className += ' ObjectFit--done';
            }, 50);
            // no src image? could be a bad tag
        } else {
            console.warn('object-fit polyfill encountered a problem: image src not found for ' + image.tagName + ' src=' + imgUrl);
        }
    };

    return {
        init: init()
    };
};

helperObjectFit.selector = selector;

exports.default = helperObjectFit;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _intersectionObserver = require('intersection-observer');

var _intersectionObserver2 = _interopRequireDefault(_intersectionObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * our own take on lazyloading, based in intersection observer (which is polyfilled in this project). Intersection observer is the way forward - it's much, much lighter on the browser CPU load.
 * Uses exactly the same markup as lazysizes https://afarkas.github.io/lazysizes/index.html to allow easy upgrade/delete/sidegrade (delete as applicable)
 * For speed (this is a a script running on the main thread during scroll), this is all vanilla JS, no jQuery.
 */

var selector = '.lazyload';
var helperLazyload = function helperLazyload(el, app) {

    var wrap = el.parentNode;
    var status = false; // has this element been discovered yet?
    var options = {
        rootMargin: '50px',
        threshold: 0.1
    };
    var imgType = false;
    var imgAttr = {};
    var imgSources = false;
    var duration = 800;
    var strut = false;
    var srcSetSupport = false;

    // on page load
    var init = function init() {
        // we need to calculate how many images need strutting and how many have been completed.
        if (!app.lazyLoad) {
            app.lazyLoad = {};
            app.lazyLoad.strutsTotal = document.querySelectorAll('.lazyload-strut').length;
            app.lazyLoad.strutsReady = 0;
        }
        // delay costly  processes a frame to allow other more important elements painted first. !!DOUBLE RAF!! https://medium.com/@paul_irish/requestanimationframe-scheduling-for-nerds-9c57f7438ef4
        (0, _raf2.default)(function tick1() {
            (0, _raf2.default)(function tick2() {
                collectAttr();
                intersectionInit();
            });
        });
        // check to see that browse supports srcset
        var img = document.createElement('img');
        srcSetSupport = 'sizes' in img;
    };

    // do as much of the DOM lookup and store it in memory before we start using the main thread for scrolling.
    var collectAttr = function collectAttr() {
        imgType = el.tagName;
        // picture element
        if (imgType === 'PICTURE') {
            imgSources = el.getElementsByTagName("SOURCE");
            for (var i = 0; i < imgSources.length; i++) {
                imgAttr.sources.push(imgSources[i].getAttribute('data-srcset'));
            }
            var imgTag = el.getElementsByTagName("IMG");
            imgAttr.width = imgTag.getAttribute('width');
            imgAttr.height = imgTag.getAttribute('height');
            // img element
        } else if (imgType === 'IMG') {
            imgAttr.src = el.getAttribute('data-src');
            imgAttr.srcSet = el.getAttribute('data-srcset');
            imgAttr.width = el.getAttribute('width');
            imgAttr.height = el.getAttribute('height');
            // element background
        } else {
            imgAttr.bg = el.getAttribute('data-bg');
        }
        // does this element need a strut before it loads?
        if (el.parentNode.className.indexOf('lazyload-strut') >= 0) {
            buildStrut();
        }
    };

    // one of the things I hate about lazyloaded images is that the page often needs to re-layout as you scroll and they load in because the browser doesn't know the dimensions of the non-existent image. This attempts to get around it when we tell it to.
    var buildStrut = function buildStrut() {

        // only for IMG and PICTURE elements
        if (['IMG', 'PICTURE'].indexOf(imgType) < 0) {
            return;
        }
        // only if we have a width and height to base the dimensions on.
        if (!imgAttr.width && !imgAttr.height) {
            return;
        }

        // all go
        strut = true;

        // prop-up the wrapper to emulate the size of the image
        var percentage = parseInt(imgAttr.height) / parseInt(imgAttr.width) * 100;
        var percentageDim = percentage + '%';
        wrap.className += ' lazyload-strut--ready';
        wrap.style.paddingTop = percentageDim;
        app.lazyLoad.strutsReady++;
        // is this the last strut on the page?
        if (app.lazyLoad.strutsReady === app.lazyLoad.strutsTotal) {
            app.trigger('lazyload-struts-ready');
        }
    };

    // set-up the intersection observer
    var intersectionInit = function intersectionInit() {
        var observer = new IntersectionObserver(intersectionObserved, options);
        observer.observe(el);
    };

    // intersection event handler
    var intersectionObserved = function intersectionObserved(entries, observer) {
        entries.forEach(function (entry) {
            // found an unloaded image!
            if (!status && entry.intersectionRatio > options.threshold) {
                loadStart();
                status = true;
            }
        });
    };

    // load the url
    var loadStart = function loadStart() {
        // prep the event after the image has loaded
        loadFile();
        // picture element
        if (imgType === 'PICTURE') {
            for (var i = 0; i < imgSources.length; i++) {
                imgSources[i].srcset = imgAttr.sources[i];
            }
            // img element
        } else if (imgType === 'IMG') {
            // if srcset is supported and the img has some srcset data, update srcset
            if (srcSetSupport && imgAttr.srcSet) {
                el.srcset = imgAttr.srcSet;
                // if srcset is not supported, or no srcset info is available, update the src
            } else if (imgAttr.src) {
                el.src = imgAttr.src;
            }
            // element background
        } else {
            el.style.backgroundImage = imgAttr.bg;
        }
        // trigger event on the element (IE9+)
        var newEvent = null;
        newEvent = new CustomEvent('imageLoaded', { detail: { 'test': 'test1' } });
        el.dispatchEvent(newEvent);
        // we've swapped the url to the image, add a class to show we're now downloading the image, even if it hasn't arrived in this frame
        el.className += ' lazyloading';
    };

    // after the image file has loaded, reveal it.
    var loadFile = function loadFile() {
        var loadFileLoaded = function loadFileLoaded() {
            // apparently a RAF frame isn't enough for Chrome to not contatinate styles, resulting in no fade. So back to setTimeout...
            setTimeout(function loadFileLoadedRAF() {
                el.className = el.className.replace('lazyloading', 'lazyloaded');
                // when the fade in is complete, remove the class
                setTimeout(function loadFileLoadedFadeEnd() {
                    el.className = el.className.replace(new RegExp('(^|\\b)' + 'lazyload' + '(\\b|$)', 'gi'), '');
                }, duration);
            }, 50);
        };
        // wait for the onload event
        el.onload = loadFileLoaded();
    };

    return {
        init: init()
    };
};

helperLazyload.selector = selector;

exports.default = helperLazyload;

},{"intersection-observer":1,"raf":8}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _lodash = require('lodash.assign');

var _lodash2 = _interopRequireDefault(_lodash);

var _helperUtilities = require('shared/mixins/helper-utilities');

var _helperUtilities2 = _interopRequireDefault(_helperUtilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var helperAnalytics = function helperAnalytics(app, noInit) {

    var utilities = (0, _helperUtilities2.default)(app);

    // previously, we could specify the GA eventCategory in the the data, eg data-js-beacon-blur="Basket,open,from list page,12" or  data-js-beacon-blur="false,open"
    // hmm, well now we've hijacked the GA eventCategory (it's calculated below in getCategory(), so it's more consistent across the site), so we don't need that first argument, eg we now use data-js-beacon-blur="open,from list page,12" or  data-js-beacon-blur="open"
    // So we face a question. Do we fix all the old markup with the old datatypes, or deal with the old and new markup side-by-side.
    var datatypes = {
        clickers: 'data-js-beacon-click',
        changers: 'data-js-beacon-change',
        blurrers: 'data-js-beacon-blur',
        loaders: 'data-js-beacon-load',
        submitters: 'data-js-beacon-submit'
    };

    var defaults = {
        landingArea: 'GeLandingArea',
        landingTime: 'GeLandingTime'
    };

    var metrics = {
        RESPONSE_START_TIME: 'metric1',
        RESPONSE_END_TIME: 'metric2',
        DOM_LOAD_TIME: 'metric3',
        WINDOW_LOAD_TIME: 'metric4'
    };

    var pageStart = 0;
    var formStart = 0;
    var formTime = 0;

    var init = function init() {

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
            sendNavigationTimingMetrics();
        }
    };

    // register the internal and shorthand events
    var registerEvents = function registerEvents() {

        app.addEventListener('beacon', function registerEventsMethod1(data) {
            beacon(false, data);
        });
        app.addEventListener('beaconLoaders', function registerEventsMethod2(data) {
            triggerLoaders();
        });
        // new
        document.addEventListener('click', function () {
            if (event.target.matches('[' + datatypes.clickers + ']')) {
                beacon();
            }
        });
        document.addEventListener('change', function () {
            if (event.target.matches('[' + datatypes.changers + ']')) {
                beacon();
            }
        });
        document.addEventListener('blur', function () {
            if (event.target.matches('[' + datatypes.blurrers + ']')) {
                beacon();
            }
        });
        document.addEventListener('submit', function () {
            if (event.target.matches('[' + datatypes.submitters + ']')) {
                beacon();
            }
        });
        // any module could put this user into a populaton bucket, eg in the företag-gas-teckna area, put this user in the "engaged" bucket this session
        app.addEventListener('addToBucket', function (ev) {
            addToBucket(ev[0], ev[1]);
        });
    };

    var sendNavigationTimingMetrics = function sendNavigationTimingMetrics() {
        // Only track performance in supporting browsers.
        if (!(window.performance && window.performance.timing)) return;

        // If the window hasn't loaded, run this function after the `load` event.
        if (document.readyState != 'complete') {
            window.addEventListener('load', sendNavigationTimingMetrics);
            return;
        }

        var nt = performance.timing;
        var navStart = nt.navigationStart;

        var responseStart = Math.round(nt.responseStart - navStart);
        var responseEnd = Math.round(nt.responseEnd - navStart);
        var domLoaded = Math.round(nt.domContentLoadedEventStart - navStart);
        var windowLoaded = Math.round(nt.loadEventStart - navStart);

        // In some edge cases browsers return very obviously incorrect NT values,
        // e.g. 0, negative, or future times. This validates values before sending.
        var allValuesAreValid = function allValuesAreValid() {
            for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
                values[_key] = arguments[_key];
            }

            return values.every(function (value) {
                return value > 0 && value < 1e6;
            });
        };

        if (allValuesAreValid(responseStart, responseEnd, domLoaded, windowLoaded)) {
            var _beacon;

            beacon(false, (_beacon = {
                eventAction: 'track',
                nonInteraction: true
            }, _defineProperty(_beacon, metrics.RESPONSE_START_TIME, responseEnd), _defineProperty(_beacon, metrics.RESPONSE_END_TIME, responseEnd), _defineProperty(_beacon, metrics.DOM_LOAD_TIME, domLoaded), _defineProperty(_beacon, metrics.WINDOW_LOAD_TIME, windowLoaded), _beacon), 'Navigation Timing');
        }
    };

    // on landing within the site, set a cookie that records the time the user arrived, and in what section (on-idle/deferred)
    var landingPage = function landingPage() {

        var landingPageDoIt = function landingPageDoIt() {

            var cookieTimeName = defaults.landingTime;
            var cookieTimeValue = sessionStorage[cookieTimeName];
            // check to see if a cookie for this  exists
            if (!cookieTimeValue) {
                var cookieAreaName = defaults.landingArea;
                var cookieCategory = getCategory();
                sessionStorage.setItem(cookieTimeName, Date.now());
                sessionStorage.setItem(cookieAreaName, cookieCategory);
            }
        };

        // do this on idlecallback if possible
        if ('requestIdleCallback' in window) {
            requestIdleCallback(landingPageDoIt);
            // otherwise, just push it out.
        } else {
            setTimeout(landingPageDoIt, 500);
        }
    };

    // on page load events triggers
    var triggerLoaders = function triggerLoaders() {

        var $loaders = document.querySelectorAll('[ ' + datatypes.loaders + ']');
        $loaders.forEach(function (index, el) {
            // send the event
            beacon(false, el.getAttribute(datatypes.loaders));
            // remove the attribute so it's not triggered again
            el.removeAttr(datatypes.loaders);
        });
    };

    // in a GA event, the first parameter is "eventCategory", and this method attempts to normalise that so that it's 
    // relation to an area of the site is consistent and usable.
    var getCategory = function getCategory(beaconBucket, extraLabel) {

        var $body = document.querySelector('body');
        var category = '';
        var dataLvl1 = $body.getAttribute('data-lvl1') || '';
        var dataLvl2 = $body.getAttribute('data-lvl2') || '';
        var dataLvl3 = $body.getAttribute('data-lvl3') || '';

        // is this page part of an "app", eg if you're in the Privat/El/Teckna workflow, you're inside a backend app
        // called "GeElPrivat" and that will be revealed in a datatype on the <BODY> tag.
        var appName = $body.getAttribute('data-cookie-app');
        if (appName) {
            category = appName + (beaconBucket && beaconBucket.toLowerCase() !== 'bucket' ? dataLvl3 : '');
            // Otherwise, if we're not in an app, most pages will have other data attributes attached to the <BODY>
        } else if (dataLvl1) {
            category = dataLvl1 + dataLvl2 + dataLvl3;
            // lastly, there's a fallback in case the body has no data attributes, use the first two levels of the path
        } else {
            category = 'Ge';
            var pathArray = self.location.pathname.split('/');
            for (var i = 0; i < pathArray.length; i++) {
                if (i == 0 || i > 2 || pathArray[i].indexOf('.') >= 0) {
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
    var parseData = function parseData(data, $el) {

        // if the data is not an object, we need to do some string parsing
        if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {

            // we need something - **anything** - to base the data on!
            if (!data.length) {
                console.warn('helperAnalytics: data sent was an empty string', $el);
                return false;
            }

            var dataArray = data.split(',');

            // *** the data should now be an array with between 1 and 3 items, eg [eventAction,eventLabel,eventValue]

            // eventAction is easy (also not that eventAction is mandatory, the )
            var dataAction = dataArray[0].trim();
            if (['false', 'undefined', 'null', ''].indexOf(dataAction) >= 0) {
                dataAction = false;
            }
            // eventValue is easy
            var dataValue = dataArray[2] ? dataArray[2].trim() : false;
            if (['false', 'undefined', 'null', ''].indexOf(dataValue) >= 0) {
                dataValue = false;
            }
            // eventLabel has some custom markup options 
            var dataLabel = dataArray[1] ? dataArray[1].trim() : false;
            if (['false', 'undefined', 'null', ''].indexOf(dataLabel) >= 0) {
                dataLabel = false;
            }
            // custom markup - ":value" means "report the value attribute". Works with all attribute names.
            if (dataLabel && $el && dataLabel.substring(0, 1) === ':') {
                var attr = dataLabel.substring(1);
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
                console.warn('helperAnalytics: data sent was an object, but didn\'t have a valid eventAction', $el, data);
                return false;
            }
        }

        return data;
    };

    // send a GA event
    var lastBeacon = null;
    var lastBeaconTime = null;
    var beacon = function beacon(ev, data, categoryOverride) {

        // two ways of triggering this method:
        // - via an HTML API, eg something like this on a DOM element: data-js-beacon-blur="Basket,open,from list page,12". This will have and event "ev", but no "data"
        // - via JS, eg helperAnalytics.beacon({category:'Basket',action:'open',label:'from list page',value:12}). This will have no event "ev", but *will* have the object passed in as "data"

        var $el = ev ? $(this) : false;

        // HTML API METHOD (data defined as a datatype), eg <a data-js-beacon-click="open,from list page,12" />
        if ($el && typeof data === 'undefined') {
            data = $el.getAttribute(datatypes.clickers) || $el.getAttribute(datatypes.changers) || $el.getAttribute(datatypes.blurrers) || $el.getAttribute(datatypes.submitters);
        }
        // ERROR - NO DATA TO BEACON??
        if (typeof data === 'undefined') {
            console.warn('helperAnalytics: NO DATA!', ev, data);
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
        var eventCategory = categoryOverride || getCategory('Beacon', data.eventCategory);

        // FINAL ASSEMBLY OF GA EVENT OBJECT
        var dataToSend = {
            hitType: 'event',
            eventCategory: eventCategory,
            eventAction: data.eventAction,
            eventLabel: data.eventLabel,
            eventValue: data.eventValue ? parseFloat(data.eventValue) : false
        };

        // EXTRA DATA FIELDS??
        var dataKeys = Object.keys(data);
        var dataExists = Object.keys(dataToSend);
        var dataExtra = {};
        dataKeys.map(function (key, index) {
            if (dataExists.indexOf(key) < 0) {
                dataExtra[key] = data[key];
            }
        });
        dataToSend = (0, _lodash2.default)(dataExtra, dataToSend);

        // BEACON MULTI_POSTING CHECK (checke the same beacon wasn't set less that 0.5s ago)
        var dataToSendString = JSON.stringify(dataToSend);
        var now = new Date();
        if (lastBeacon === dataToSendString && now - lastBeaconTime < 500) {
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
            console.warn('helperAnalytics: error sending beacon', error, ev, data, dataToSend);
        }
    };

    // method so any module could put this user into a population bucket.
    // eg in the företag-gas-teckna area, put this user in the "engaged" bucket this session
    // option: the "ab" parameter can add a suffix to the bucket label, to discriminate in multi-testing environments (eg, setting an "engaged" bucket to "2018JanTest" results in a GA label of "engaged-2018JanTest")
    // option: GA label can also be communicated through a bucket.
    var addToBucket = function addToBucket(bucket, ab) {
        var category = getCategory('Bucket');
        // check to see if a cookie for this bucket exists (remove any '-late' suffixes, or we'll be testing against the wrong indicator)
        var cookieName = category + utilities.capitalizeFirstLetter(bucket.replace('-late', '').toLowerCase());
        var cookieValue = sessionStorage[cookieName];
        if (!cookieValue) {
            // Calc timings since landing page (in whole secs)
            var cookieTimeName = defaults.landingTime;
            var cookieTimeValue = sessionStorage[cookieTimeName];
            var secSince = 0;
            if (cookieTimeValue) {
                var timeNow = Date.now();
                secSince = parseInt((timeNow - parseInt(cookieTimeValue)) / 1000);
            }
            // drop a cookie, so this user isn't entered into this bucket again this session
            sessionStorage.setItem(cookieName, secSince);
            // beacon
            beacon(false, {
                'eventAction': 'bucket',
                'eventLabel': bucket + (ab ? '-' + ab : ''),
                'eventValue': secSince
            });
        }
        // if the cookie bucket is a decision, remove any conversion buckets, because the user might be doing a second pass!
        var cookieConversionName = category + 'Conversion';
        var cookieConversion = sessionStorage[cookieConversionName];
        if (bucket.toLowerCase().indexOf('decision') >= 0 && typeof cookieConversion !== 'undefined') {
            sessionStorage.removeItem(cookieConversionName);
        }
    };

    var getDefaults = function getDefaults() {
        return defaults;
    };

    return {
        init: init(),
        beacon: beacon,
        triggerLoaders: triggerLoaders,
        getDefaults: getDefaults,
        getCategory: getCategory
    };
};

exports.default = helperAnalytics;

},{"lodash.assign":3,"shared/mixins/helper-utilities":17}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _helperA11y = require('shared/mixins/helper-a11y');

var _helperA11y2 = _interopRequireDefault(_helperA11y);

var _helperUtilities = require('shared/mixins/helper-utilities');

var _helperUtilities2 = _interopRequireDefault(_helperUtilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * 
 */

var selector = '[data-js-toggle]';
var toggleContent = function toggleContent(el, app) {

    var a11yHelper = (0, _helperA11y2.default)(app);
    var utilities = (0, _helperUtilities2.default)(app);

    var acceptingClicks = false; // true during the toggling transition, when no further action can be started
    var status = false; // current status of toggle: TRUE: content hidden (opposite visible) : FALSE: content visible (opposite hidden)
    var initStatus = false; // the initial state of the toggle (TRUE: content hidden (opposite visible) : FALSE: content visible (opposite hidden))
    var keyboardDriven = false; // lets us know if the opening action was keyboard or mouseclick/tap driven (helps with determining what UI focus and hints to use)

    var $window = $(window);
    var content = el;
    var $content = $(content); // the $ obj of primary content content container that will be toggled off and one
    var $opposite = $($content.attr('data-toggle-opposite')); // the optional $ obj of any secondary container that needs to be toggled in the opposite direction at the same time.
    var $buttons = $($content.attr('data-toggle-button')); // the $ obj of any buttons/inputs that will carry out the toggling
    var requiredVal = $content.attr('data-toggle-button-value'); // if the elements that trigger the toggling are an input/select, what is the required value that triggers the toggle?

    var contentHeight = 2000; // default content height
    var contentTop = 0; // default content top
    var oppositeHeight = 2000; // default opposite content height
    var oppositeTop = 0; // default opposite content top
    var buttonTop = 0; // button top position
    var duration = 300; // transition duration

    /* classes */

    var classContentReady = 'Toggle-Content--ready';
    var classContentStateVisible = 'Toggle-Content--visible';
    var classContentStateHidden = 'Toggle-Content--hidden';
    var classContentSection = 'Toggle-Content--section';
    var classContentHeight = 'Toggle-Content--height';
    var classContentAnimate = 'Toggle-Content--animate';

    var classButtonReady = 'Toggle-Btn--ready';
    var classButtonStateUnToggled = 'Toggle-Btn--off';
    var classButtonStateToggled = 'Toggle-Btn--on';

    var classOppositeReady = 'Toggle-Opposite--ready';
    var classOppositeStateHidden = 'Toggle-Opposite--hidden';
    var classOppositeStateVisible = 'Toggle-Opposite--visible';
    var classOppositeSection = 'Toggle-Opposite--section';
    var classOppositeHeight = 'Toggle-Opposite--height';
    var classOppositeAnimate = 'Toggle-Opposite--animate';

    var init = function init() {
        // don't init if inside a popup - it will be initialised when the popup is initialised
        if ($content.closest('[data-js-popup]').length) {
            return;
        }
        // determine if components need to transition heights as well as opacity
        if ($content.attr('data-toggle-height') !== undefined) {
            $content.addClass(classContentHeight);
        }
        if ($content.attr('data-toggle-opposite-height') !== undefined) {
            $opposite.addClass(classOppositeHeight);
        }
        // measure content before it is set and set the css 
        measureAndSet();
        // what is the initial state (which we then say if the current state - at this point)
        initStatus = getInitState();
        status = initStatus;
        // initialise the paload state
        initState();
        // initialise the buttons
        registerEvents();
        // start accepting clicks
        acceptingClicks = true;
        // notify other methods that the toggle is ready
        (0, _raf2.default)(function tick1() {
            (0, _raf2.default)(function tick2() {
                app.trigger('toggleReady', [$content]);
            });
        });
        setTimeout(function () {
            measureAfterInit();
        }, 800);
    };

    // measure content before it is set and THEN set the css to create the initial state
    var measureAndSet = function measureAndSet() {
        // content height
        var contentRect = content.getBoundingClientRect();
        contentTop = contentRect.top + $window.scrollTop();
        contentHeight = contentRect.height;
        content.style.setProperty('--maxHeight', contentHeight + 'px');
        // opposite height
        if ($opposite && $opposite.length) {
            oppositeHeight = $opposite[0].offsetHeight;
            $opposite[0].style.setProperty('--maxHeight', contentHeight + 'px');
        }
    };

    // measure after the initial state is set (to find the "initial" position of the buttons)
    var measureAfterInit = function measureAfterInit() {
        // button initial positions (only complicated by potentially being multiple buttons to the same content)
        $.each($buttons, function (index, button) {
            var $button = $(button);
            var buttonRect = button.getBoundingClientRect();
            $button.data('toggleTop', buttonRect.top + $window.scrollTop());
        });
    };

    // on initialisation, get the initial state of this toggle
    var getInitState = function getInitState() {
        // what is the default initial state
        var output = $content.attr('data-toggle-init-closed') !== undefined ? true : false;
        // override it if we're basing the staus on a radio/checkbox (could be set by form being prefilled by JS)
        if (typeof requiredVal !== 'undefined') {
            var buttonVal = $buttons.filter(':checked').val();
            output = requiredVal.localeCompare(buttonVal) === 0 ? false : true;
            // otherwise, override it by reading the class of the content
        } else if ($content.hasClass(classContentStateVisible)) {
            output = $content.hasClass(classContentStateVisible) ? false : true;
        }
        return output;
    };

    // on inirtialisation, set the pieces up as it should be.
    var initState = function initState() {
        // set-up the initial state (before animations are set)
        toggleAll(status);
        // only add the animation classes after the state is set-up (stops initial animate-in)
        (0, _raf2.default)(function tick1() {
            (0, _raf2.default)(function tick2() {
                $content.addClass(classContentReady).addClass(classContentAnimate);
                $opposite.addClass(classOppositeReady).addClass(classOppositeAnimate);
                $buttons.addClass(classButtonReady);
            });
        });
    };

    // register events
    var registerEvents = function registerEvents() {
        var action = 'click';
        if ($buttons.is('input[type="checkbox"]') || $buttons.is('input[type="radio"]')) {
            action = 'change';
        }
        $buttons.on(action, function (ev) {
            var $button = $(this);
            // if the button is a checkbox/radio and requires a specific value
            if (typeof requiredVal !== 'undefined') {
                var buttonVal = $buttons.filter(':checked').val();
                status = requiredVal.localeCompare(buttonVal) === 0 ? false : true;
                // if no value is required, toggle the status on each click
            } else {
                status = !status;
            }
            keyboardDriven = utilities.keyboardClick(ev);
            checkNeedForScrollThenToggle(status, ev, $button);
        });
        // trigger event from outside.
        $content.on('toggleAll', function () {
            toggleAll();
        });
    };

    var checkNeedForScrollThenToggle = function checkNeedForScrollThenToggle(changeTo, ev, $button) {
        var buttonTop = $button.data('toggleTop'); // what is the "original" (eg, closed) position of this button?
        var scrollTop = $window.scrollTop();
        var outOfViewPort = buttonTop < scrollTop ? true : false;
        //console.log(buttonTop, scrollTop, outOfViewPort);
        if (outOfViewPort) {
            setTimeout(function () {
                toggleAll(status, ev, $button);
            }, duration + 50);
            scrollToStart(buttonTop, scrollTop, $button);
        } else {
            (0, _raf2.default)(function tick1() {
                (0, _raf2.default)(function tick2() {
                    toggleAll(status, ev, $button);
                });
            });
        }
    };

    var scrollToStart = function scrollToStart(buttonTop, scrollTop, $button) {
        // Is there a sticky menu that is in the sticky point? This will effect scrolling point.
        var stickyActive = app.navStickyStatus;
        var newTop = buttonTop - (stickyActive ? 70 : 0) - 100 + 'px';
        $content.css('transition-timing-function', 'linear');
        // scroll for a period of time equal to the distance in px needed to scroll (so a small amount doesn't look horribly slow), up to a maximum amount of time (800ms)
        $('html,body').animate({ scrollTop: newTop }, { 'duration': duration, 'easing': 'swing' }); // same duration as the max-height transition
    };

    // trigger the toggle transition
    var toggleAll = function toggleAll(changeTo, ev, $button) {
        // if no state decided, toggle to the oppisite of the existing status
        if (typeof changeTo === 'undefined') {
            changeTo = !status;
        }
        // do it!
        toggleContent(changeTo, ev);
        toggleOpposite(changeTo, ev);
        toggleButton(changeTo, ev, $button);
        // notify other methods that the toggle has finished
        setTimeout(function () {
            app.trigger('toggleToggled', [$content, changeTo]);
        }, duration);
        // update internal status
        status = changeTo;
    };

    // toggle the content area
    var toggleContent = function toggleContent(state, ev) {
        if (state === true) {
            $content.removeClass(classContentStateVisible);
            // hide all aria and hidden fields
            a11yHelper.hide($content);
        } else {
            $content.addClass(classContentStateVisible);
            // enable all aria and hidden fields
            a11yHelper.show($content);
            // if we're keyboard navigating, focus on the first item in the content
            a11yHelper.reFocus(ev, $content.find('a,button,input,select').first());
        }
    };

    // toggle the button
    var toggleButton = function toggleButton(state, ev, $button) {
        if (!$buttons.length) {
            return;
        }
        if (state === true) {
            $buttons.addClass(classButtonStateUnToggled).removeClass(classButtonStateToggled);
        } else {
            $buttons.addClass(classButtonStateToggled).removeClass(classButtonStateUnToggled);
        }
    };

    // toggle the optional opposite area
    var toggleOpposite = function toggleOpposite(state, ev) {
        if (!$opposite.length) {
            return;
        }
        if (state) {
            $opposite.addClass(classOppositeStateVisible);
        } else {
            $opposite.removeClass(classOppositeStateVisible);
        }
    };

    return {
        init: init()
    };
};

toggleContent.selector = selector;

exports.default = toggleContent;

},{"raf":8,"shared/mixins/helper-a11y":12,"shared/mixins/helper-utilities":17}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _localeComparePolyfill = require('locale-compare-polyfill');

var _localeComparePolyfill2 = _interopRequireDefault(_localeComparePolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method
 */
var helperUtilities = function helperUtilities(app) {

    var init = function init() {
        // only init this stuff once please!
        if (!app.utilitesInit) {
            detectIos();
            detectAndroid();
            detectIE();
            detectEdge();
            detectTouch();
            polyfills();
            detectCachedPage();
        }
        app.utilitesInit = true;
    };

    var detectIos = function detectIos() {
        var userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof document.querySelectorAll != 'undefined' && !document.querySelector('html').classList.contains('ios') && /iphone|ipad|ipod/i.test(userAgentTest)) {
            window.PLATFORM_IOS = true;

            if (/iphone|ipod|ipad/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('ios');
                if (/iphone|ipod/i.test(userAgentTest)) {
                    document.querySelector('html').classList.add('iphone');
                } else if (/ipad/i.test(userAgentTest)) {
                    document.querySelector('html').classList.add('ipad');
                }
                if (document.querySelector('body')) {
                    // testing just because of a bug in the SC5 pattern library
                    document.querySelector('body').setAttribute('ontouchstart', ''); // this is an old iOS hack to get :hover and :active states working. Not needed for Android.
                }
                var safariVersMaj = /version\/([0-9]*)./.exec(userAgentTest);
                if (safariVersMaj) {
                    safariVersMaj = parseInt(safariVersMaj[1]);
                    document.querySelector('html').classList.add('ios' + safariVersMaj);
                }
            }
        }
    };

    var detectAndroid = function detectAndroid() {
        var userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof document.querySelectorAll != 'undefined' && !document.querySelector('html').classList.contains('android') && /android/i.test(userAgentTest)) {
            window.PLATFORM_ANDROID = true;

            if (/android/i.test(userAgentTest) && /mobile/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('android', 'android-mobile');
            } else if (/android/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('android', 'android-tablet');
            }
            // detect samsung browser variation of Chromium (it's a big enough segment that it's worth flagging)
            if (/samsungbrowser/i.test(userAgentTest)) {
                document.querySelector('html').classList.add('samsung-browser');
            }
            // detect if this version of Android Chrome supports 100%VH as the minimum vertical space (on page load, with url bar/tabs) or maximum vertical space (after scrolling down). 
            // The behaviour changed in 56, and it has a profound effect if we're trying to guess the vertical size of the screen in CSS! This effects Samsung Browser too, as it normally lags about 8 versions behind in chromium.
            var chromeVersMaj = /chrome\/([0-9]*)./.exec(userAgentTest);
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

    var detectIE = function detectIE() {
        var userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof document.querySelectorAll != 'undefined' && !document.querySelector('html').classList.contains('ie') && /trident/i.test(userAgentTest)) {
            if (/trident/i.test(userAgentTest)) {
                window.BROWSER_IE = true;
                document.querySelector('html').classList.add('ie');
                var ieVersMaj = /rv:([0-9]*)./.exec(userAgentTest);
                if (ieVersMaj) {
                    ieVersMaj = parseInt(ieVersMaj[1]);
                    document.querySelector('html').classList.add('ie' + ieVersMaj);
                }
            }
        }
    };

    var detectEdge = function detectEdge() {
        var userAgentTest = navigator.userAgent.toLowerCase();
        if (typeof document.querySelectorAll != 'undefined' && !document.querySelector('html').classList.contains('edge') && / Edge/i.test(userAgentTest)) {
            if (/edge/i.test(userAgentTest)) {
                window.BROWSER_EDGE = true;
                document.querySelector('html').classList.add('edge');
                var EdgeVersMaj = /edge\/([0-9]*)./.exec(userAgentTest);
                if (EdgeVersMaj) {
                    EdgeVersMaj = parseInt(EdgeVersMaj[1]);
                    document.querySelector('html').classList.add('edge' + EdgeVersMaj);
                }
            }
        }
    };

    // detect touch screens on first countact with a big squidgy finger
    var detectTouch = function detectTouch(obj) {
        window.addEventListener('touchstart', function onFirstTouch() {
            document.querySelector('html').classList.add('touch');
            window.TOUCH_ENABLED = true;
            window.removeEventListener('touchstart', onFirstTouch, false);
        }, supportsPassive ? { passive: true } : false);
    };

    // remove unwanted selected text (often a byproduct of accidently double clicking on a button, link, etc)
    var unselectAllText = function unselectAllText() {
        if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    };

    // Test via a getter in the options object to see if the passive property is accessed
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function get() {
                supportsPassive = true;
            }
        });
        window.addEventListener("test", null, opts);
    } catch (e) {}

    // our own clone
    var clone = function clone(obj) {

        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" != (typeof obj === 'undefined' ? 'undefined' : _typeof(obj))) return obj;

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
    var intersect = function intersect(a, b) {
        var d = {};
        var results = [];
        for (var i = 0; i < b.length; i++) {
            d[b[i]] = true;
        }
        for (var j = 0; j < a.length; j++) {
            if (d[a[j]]) results.push(a[j]);
        }
        return results;
    };

    // scroll the page to the top of an element
    var scrollToEl = function scrollToEl(selector, duration) {
        if (duration < 0) duration = 600;
        $("html, body").animate({ scrollTop: $(selector).offset().top }, duration);
    };

    // from http://www.albertogasparin.it/articles/2014/04/detect-css-support-of-property-value/
    var featureTestEl = {};
    var featureTest = function featureTest(property, value, noPrefixes) {
        // Thanks Modernizr!
        var prop = property + ':';
        // only mess with DOM one time if we're going to use this again and again
        if (typeof featureTestEl.style === 'undefined') {
            featureTestEl = document.createElement('test');
        }
        var featureTestStyle = featureTestEl.style;
        if (!noPrefixes) {
            featureTestStyle.cssText = prop + ['-webkit-', '-moz-', '-ms-', '-o-', ''].join(value + ';' + prop) + value + ';';
        } else {
            featureTestStyle.cssText = prop + value;
        }
        return featureTestStyle[property];
    };

    var polyfills = function polyfills() {

        // isInteger polyfill (not in IE)
        Number.isInteger = Number.isInteger || function (value) {
            return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
        };

        // custom event polyfill
        (function () {
            if (typeof window.CustomEvent === "function") return false;
            function CustomEvent(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        })();

        // padLeft (polyfilling the native padStart() method)
        // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
        if (!String.prototype.padStart) {
            String.prototype.padStart = function padStart(targetLength, padString) {
                targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
                padString = String(typeof padString !== 'undefined' ? padString : ' ');
                if (this.length > targetLength) {
                    return String(this);
                } else {
                    targetLength = targetLength - this.length;
                    if (targetLength > padString.length) {
                        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                    }
                    return padString.slice(0, targetLength) + String(this);
                }
            };
        }
    };

    var getAppName = function getAppName() {
        return $('[data-cookie-app]').data('cookie-app');
    };

    var detectCachedPage = function detectCachedPage() {
        //window.addEventListener( 'pageshow', function( ev ){
        //    if (window.performance && window.performance.navigation.type=='2') {
        //        alert('CACHED')
        //       console.log('CACHED!!')
        //    }
        //});
    };

    // URL LOCATION/SEARCH MANIPULATION

    var searchToHash = function searchToHash() {
        var h = {};
        if (window.location.search == undefined || window.location.search.length < 1) {
            return h;
        }
        var q = window.location.search.slice(1).split('&');
        for (var i = 0; i < q.length; i++) {
            var key_val = q[i].split('=');
            // replace '+' (alt space) char explicitly since decode does not
            var hkey = decodeURIComponent(key_val[0]).replace(/\+/g, ' ');
            var hval = decodeURIComponent(key_val[1]).replace(/\+/g, ' ');
            if (h[hkey] == undefined) {
                h[hkey] = [];
            }
            h[hkey].push(hval);
        }
        return h;
    };

    var hashToSearch = function hashToSearch(h) {
        var search = "?";
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

    var getQueryVariable = function getQueryVariable(variable) {
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

    var addQueryVariable = function addQueryVariable(name, value) {
        var newSearchHash = hashToSearch();
        newSearchHash[decodeURIComponent(name)] = decodeURIComponent(value);
        return hashToSearch(newSearchHash);
    };

    var removeQueryVariable = function removeQueryVariable(name) {
        var newSearchHash = searchToHash();
        if (newSearchHash[name]) {
            delete newSearchHash[name];
        }
        return hashToSearch(newSearchHash);
    };

    // use an event to detect if a click event is a keyboard enter (ie, a keyboard navigation event), or a mouse click event.
    // This helps use change the UI like using keyboard highlights where appropriate.
    // returns true for keyboard events, false for mouseclick events, and optionally runs a callback if it's a keyboard event
    var keyboardClick = function keyboardClick(ev, callback) {

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
    var hashCode = function hashCode(s) {
        return s.split("").reduce(function (a, b) {
            a = (a << 5) - a + b.charCodeAt(0);return a & a;
        }, 0);
    };

    // purpose clear
    var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return {
        init: init(),
        unselectAllText: unselectAllText,
        clone: clone,
        intersect: intersect,
        scrollToEl: scrollToEl,
        featureTest: featureTest,
        supportsPassive: supportsPassive,
        getAppName: getAppName,
        getQueryVariable: getQueryVariable,
        removeQueryVariable: removeQueryVariable,
        keyboardClick: keyboardClick,
        hashCode: hashCode,
        capitalizeFirstLetter: capitalizeFirstLetter
    };
};

exports.default = helperUtilities;

},{"locale-compare-polyfill":2}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @method
 */
var helperA11y = function helperA11y() {

    // on opening dialogs/closing, popups, etc, it's best to focus on a particular element so the tab/screenreader navigation options are clear
    var reFocus = function reFocus(ev, $firstFocusable) {
        // listen for the popover to be completed
        setTimeout(function popButtonTimeout() {
            // detect the tab being hit by keyboard (the clientX/Y will be 0)
            if (ev && ev.clientX === 0 && ev.clientY === 0) {
                // move focus
                if ($firstFocusable.length) {
                    $firstFocusable.focus();
                    $firstFocusable.classList.add('focus-visible');
                }
            }
        }, 200);
    };

    // hide this element and all enclosed tab accessible elements from keyboard/screenreader navigation
    var hide = function hide($el) {
        $el.setAttribute('aria-hidden', 'true');
        $el.find('a,button,input,textarea,select,label[tabindex=0]').attr('tabindex', -1).attr('aria-hidden', 'true');
    };

    // reveal this element and all enclosed tab accessible elements to keyboard/screenreader navigation
    var show = function show($el) {
        $el.setAttribute('aria-hidden', 'false');
        $el.find('a,button,input,textarea,select,label[tabindex=-1]').attr('tabindex', 0).attr('aria-hidden', 'false');
    };

    return {
        reFocus: reFocus,
        hide: hide,
        show: show
    };
};

exports.default = helperA11y;

},{}],8:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":5}],7:[function(require,module,exports){
(function (setImmediate){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') throw new TypeError('Promise.all accepts an array');
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

}).call(this,require("timers").setImmediate)
},{"timers":9}],9:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":6,"timers":9}],5:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = assign;

},{}],2:[function(require,module,exports){
(function() {
  'use strict';

  var localeCompareSupport = 'ø'.localeCompare('p', 'da-DK') > 0;

  if (!localeCompareSupport) {

    var characterMaps = {
      'da': '­  _-,;:!¡?¿.·\'"«»()[]{}§¶@*/\&#%`´^¯¨¸°©®+±÷×<=>¬|¦~¤¢$£¥01¹½¼2²3³¾456789AaªÁáÀàÂâÃãBbCcÇçDdÐðEeÉéÈèÊêËëFfGgHhIiÍíÌìÎîÏïJjKkLlMmNnÑñOoºÓóÒòÔôÕõPpQqRrSsßTtÞþUuÚúÙùÛûVvWwXxYyÝýÿÜüZzÆæÄäØøÖöÅåµ',
      'nb': '­  _-,;:!¡?¿.·\'"«»()[]{}§¶@*/\&#%`´^¯¨¸°©®+±÷×<=>¬|¦~¤¢$£¥01¹½¼2²3³¾456789aAªáÁàÀâÂãÃbBcCçÇdDðÐeEéÉèÈêÊëËfFgGhHiIíÍìÌîÎïÏjJkKlLmMnNñÑoOºóÓòÒôÔõÕpPqQrRsSßtTþÞuUúÚùÙûÛvVwWxXyYýÝÿüÜzZæÆäÄøØöÖåÅµ',
      'se': '­  _-,;:!¡?¿.·\'"«»()[]{}§¶@*/\&#%`´^¯¨¸°©®+±÷×<=>¬|¦~¤¢$£¥01¹½¼2²3³¾456789aAªáÁàÀâÂåÅäÄãÃæÆbBcCçÇdDðÐeEéÉèÈêÊëËfFgGhHiIíÍìÌîÎïÏjJkKlLmMnNñÑoOºóÓòÒôÔöÖõÕøØpPqQrRsSßtTuUúÚùÙûÛüÜvVwWxXyYýÝÿzZþÞµ',
      'fi': '­  _-,;:!¡?¿.·\'"«»()[]{}§¶@*/\&#%`´^¯¨¸°©®+±÷×<=>¬|¦~¤¢$£¥01¹½¼2²3³¾456789aAªáÁàÀâÂãÃbBcCçÇdDðÐeEéÉèÈêÊëËfFgGhHiIíÍìÌîÎïÏjJkKlLmMnNñÑoOºóÓòÒôÔõÕpPqQrRsSßtTuUúÚùÙûÛvVwWxXyYýÝÿüÜzZþÞåÅäÄæÆöÖøØµ',
      'de': '­  _-,;:!¡?¿.·\'"«»()[]{}§¶@*/\&#%`´^¯¨¸°©®+±÷×<=>¬|¦~¤¢$£¥01¹½¼2²3³¾456789aAªáÁàÀâÂåÅäÄãÃæÆbBcCçÇdDðÐeEéÉèÈêÊëËfFgGhHiIíÍìÌîÎïÏjJkKlLmMnNñÑoOºóÓòÒôÔöÖõÕøØpPqQrRsSßtTuUúÚùÙûÛüÜvVwWxXyYýÝÿzZþÞµ',
      'en': ' _-,;:!?.\'"()[]{}@*/\&#%`^+<=>|~$0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ'
    };

    var original = String.prototype.localeCompare;

    String.prototype.localeCompare = function(other, locale) {
      if (!locale) { return original.apply(this, arguments); }
      var lang = locale.split('-')[0];
      var map = characterMaps[lang];

      var charA = null, charB = null, index = 0;
      while (charA === charB && index < 100) {
        charA = this.toString()[index];
        charB = other[index];
        index++;
      }
      return Math.max(-1, Math.min(1, map.indexOf(charA) - map.indexOf(charB)));
    }
  }
})();

},{}],1:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */

(function(window, document) {
'use strict';


// Exits early if all IntersectionObserver and IntersectionObserverEntry
// features are natively supported.
if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

  // Minimal polyfill for Edge 15's lack of `isIntersecting`
  // See: https://github.com/w3c/IntersectionObserver/issues/211
  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    Object.defineProperty(window.IntersectionObserverEntry.prototype,
      'isIntersecting', {
      get: function () {
        return this.intersectionRatio > 0;
      }
    });
  }
  return;
}


/**
 * An IntersectionObserver registry. This registry exists to hold a strong
 * reference to IntersectionObserver instances currently observering a target
 * element. Without this registry, instances without another reference may be
 * garbage collected.
 */
var registry = [];


/**
 * Creates the global IntersectionObserverEntry constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
 * @param {Object} entry A dictionary of instance properties.
 * @constructor
 */
function IntersectionObserverEntry(entry) {
  this.time = entry.time;
  this.target = entry.target;
  this.rootBounds = entry.rootBounds;
  this.boundingClientRect = entry.boundingClientRect;
  this.intersectionRect = entry.intersectionRect || getEmptyRect();
  this.isIntersecting = !!entry.intersectionRect;

  // Calculates the intersection ratio.
  var targetRect = this.boundingClientRect;
  var targetArea = targetRect.width * targetRect.height;
  var intersectionRect = this.intersectionRect;
  var intersectionArea = intersectionRect.width * intersectionRect.height;

  // Sets intersection ratio.
  if (targetArea) {
    this.intersectionRatio = intersectionArea / targetArea;
  } else {
    // If area is zero and is intersecting, sets to 1, otherwise to 0
    this.intersectionRatio = this.isIntersecting ? 1 : 0;
  }
}


/**
 * Creates the global IntersectionObserver constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
 * @param {Function} callback The function to be invoked after intersection
 *     changes have queued. The function is not invoked if the queue has
 *     been emptied by calling the `takeRecords` method.
 * @param {Object=} opt_options Optional configuration options.
 * @constructor
 */
function IntersectionObserver(callback, opt_options) {

  var options = opt_options || {};

  if (typeof callback != 'function') {
    throw new Error('callback must be a function');
  }

  if (options.root && options.root.nodeType != 1) {
    throw new Error('root must be an Element');
  }

  // Binds and throttles `this._checkForIntersections`.
  this._checkForIntersections = throttle(
      this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

  // Private properties.
  this._callback = callback;
  this._observationTargets = [];
  this._queuedEntries = [];
  this._rootMarginValues = this._parseRootMargin(options.rootMargin);

  // Public properties.
  this.thresholds = this._initThresholds(options.threshold);
  this.root = options.root || null;
  this.rootMargin = this._rootMarginValues.map(function(margin) {
    return margin.value + margin.unit;
  }).join(' ');
}


/**
 * The minimum interval within which the document will be checked for
 * intersection changes.
 */
IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


/**
 * The frequency in which the polyfill polls for intersection changes.
 * this can be updated on a per instance basis and must be set prior to
 * calling `observe` on the first target.
 */
IntersectionObserver.prototype.POLL_INTERVAL = null;

/**
 * Use a mutation observer on the root element
 * to detect intersection changes.
 */
IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


/**
 * Starts observing a target element for intersection changes based on
 * the thresholds values.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.observe = function(target) {
  var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
    return item.element == target;
  });

  if (isTargetAlreadyObserved) {
    return;
  }

  if (!(target && target.nodeType == 1)) {
    throw new Error('target must be an Element');
  }

  this._registerInstance();
  this._observationTargets.push({element: target, entry: null});
  this._monitorIntersections();
  this._checkForIntersections();
};


/**
 * Stops observing a target element for intersection changes.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.unobserve = function(target) {
  this._observationTargets =
      this._observationTargets.filter(function(item) {

    return item.element != target;
  });
  if (!this._observationTargets.length) {
    this._unmonitorIntersections();
    this._unregisterInstance();
  }
};


/**
 * Stops observing all target elements for intersection changes.
 */
IntersectionObserver.prototype.disconnect = function() {
  this._observationTargets = [];
  this._unmonitorIntersections();
  this._unregisterInstance();
};


/**
 * Returns any queue entries that have not yet been reported to the
 * callback and clears the queue. This can be used in conjunction with the
 * callback to obtain the absolute most up-to-date intersection information.
 * @return {Array} The currently queued entries.
 */
IntersectionObserver.prototype.takeRecords = function() {
  var records = this._queuedEntries.slice();
  this._queuedEntries = [];
  return records;
};


/**
 * Accepts the threshold value from the user configuration object and
 * returns a sorted array of unique threshold values. If a value is not
 * between 0 and 1 and error is thrown.
 * @private
 * @param {Array|number=} opt_threshold An optional threshold value or
 *     a list of threshold values, defaulting to [0].
 * @return {Array} A sorted list of unique and valid threshold values.
 */
IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
  var threshold = opt_threshold || [0];
  if (!Array.isArray(threshold)) threshold = [threshold];

  return threshold.sort().filter(function(t, i, a) {
    if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
      throw new Error('threshold must be a number between 0 and 1 inclusively');
    }
    return t !== a[i - 1];
  });
};


/**
 * Accepts the rootMargin value from the user configuration object
 * and returns an array of the four margin values as an object containing
 * the value and unit properties. If any of the values are not properly
 * formatted or use a unit other than px or %, and error is thrown.
 * @private
 * @param {string=} opt_rootMargin An optional rootMargin value,
 *     defaulting to '0px'.
 * @return {Array<Object>} An array of margin objects with the keys
 *     value and unit.
 */
IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
  var marginString = opt_rootMargin || '0px';
  var margins = marginString.split(/\s+/).map(function(margin) {
    var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
    if (!parts) {
      throw new Error('rootMargin must be specified in pixels or percent');
    }
    return {value: parseFloat(parts[1]), unit: parts[2]};
  });

  // Handles shorthand.
  margins[1] = margins[1] || margins[0];
  margins[2] = margins[2] || margins[0];
  margins[3] = margins[3] || margins[1];

  return margins;
};


/**
 * Starts polling for intersection changes if the polling is not already
 * happening, and if the page's visibilty state is visible.
 * @private
 */
IntersectionObserver.prototype._monitorIntersections = function() {
  if (!this._monitoringIntersections) {
    this._monitoringIntersections = true;

    // If a poll interval is set, use polling instead of listening to
    // resize and scroll events or DOM mutations.
    if (this.POLL_INTERVAL) {
      this._monitoringInterval = setInterval(
          this._checkForIntersections, this.POLL_INTERVAL);
    }
    else {
      addEvent(window, 'resize', this._checkForIntersections, true);
      addEvent(document, 'scroll', this._checkForIntersections, true);

      if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in window) {
        this._domObserver = new MutationObserver(this._checkForIntersections);
        this._domObserver.observe(document, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    }
  }
};


/**
 * Stops polling for intersection changes.
 * @private
 */
IntersectionObserver.prototype._unmonitorIntersections = function() {
  if (this._monitoringIntersections) {
    this._monitoringIntersections = false;

    clearInterval(this._monitoringInterval);
    this._monitoringInterval = null;

    removeEvent(window, 'resize', this._checkForIntersections, true);
    removeEvent(document, 'scroll', this._checkForIntersections, true);

    if (this._domObserver) {
      this._domObserver.disconnect();
      this._domObserver = null;
    }
  }
};


/**
 * Scans each observation target for intersection changes and adds them
 * to the internal entries queue. If new entries are found, it
 * schedules the callback to be invoked.
 * @private
 */
IntersectionObserver.prototype._checkForIntersections = function() {
  var rootIsInDom = this._rootIsInDom();
  var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

  this._observationTargets.forEach(function(item) {
    var target = item.element;
    var targetRect = getBoundingClientRect(target);
    var rootContainsTarget = this._rootContainsTarget(target);
    var oldEntry = item.entry;
    var intersectionRect = rootIsInDom && rootContainsTarget &&
        this._computeTargetAndRootIntersection(target, rootRect);

    var newEntry = item.entry = new IntersectionObserverEntry({
      time: now(),
      target: target,
      boundingClientRect: targetRect,
      rootBounds: rootRect,
      intersectionRect: intersectionRect
    });

    if (!oldEntry) {
      this._queuedEntries.push(newEntry);
    } else if (rootIsInDom && rootContainsTarget) {
      // If the new entry intersection ratio has crossed any of the
      // thresholds, add a new entry.
      if (this._hasCrossedThreshold(oldEntry, newEntry)) {
        this._queuedEntries.push(newEntry);
      }
    } else {
      // If the root is not in the DOM or target is not contained within
      // root but the previous entry for this target had an intersection,
      // add a new record indicating removal.
      if (oldEntry && oldEntry.isIntersecting) {
        this._queuedEntries.push(newEntry);
      }
    }
  }, this);

  if (this._queuedEntries.length) {
    this._callback(this.takeRecords(), this);
  }
};


/**
 * Accepts a target and root rect computes the intersection between then
 * following the algorithm in the spec.
 * TODO(philipwalton): at this time clip-path is not considered.
 * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
 * @param {Element} target The target DOM element
 * @param {Object} rootRect The bounding rect of the root after being
 *     expanded by the rootMargin value.
 * @return {?Object} The final intersection rect object or undefined if no
 *     intersection is found.
 * @private
 */
IntersectionObserver.prototype._computeTargetAndRootIntersection =
    function(target, rootRect) {

  // If the element isn't displayed, an intersection can't happen.
  if (window.getComputedStyle(target).display == 'none') return;

  var targetRect = getBoundingClientRect(target);
  var intersectionRect = targetRect;
  var parent = getParentNode(target);
  var atRoot = false;

  while (!atRoot) {
    var parentRect = null;
    var parentComputedStyle = parent.nodeType == 1 ?
        window.getComputedStyle(parent) : {};

    // If the parent isn't displayed, an intersection can't happen.
    if (parentComputedStyle.display == 'none') return;

    if (parent == this.root || parent == document) {
      atRoot = true;
      parentRect = rootRect;
    } else {
      // If the element has a non-visible overflow, and it's not the <body>
      // or <html> element, update the intersection rect.
      // Note: <body> and <html> cannot be clipped to a rect that's not also
      // the document rect, so no need to compute a new intersection.
      if (parent != document.body &&
          parent != document.documentElement &&
          parentComputedStyle.overflow != 'visible') {
        parentRect = getBoundingClientRect(parent);
      }
    }

    // If either of the above conditionals set a new parentRect,
    // calculate new intersection data.
    if (parentRect) {
      intersectionRect = computeRectIntersection(parentRect, intersectionRect);

      if (!intersectionRect) break;
    }
    parent = getParentNode(parent);
  }
  return intersectionRect;
};


/**
 * Returns the root rect after being expanded by the rootMargin value.
 * @return {Object} The expanded root rect.
 * @private
 */
IntersectionObserver.prototype._getRootRect = function() {
  var rootRect;
  if (this.root) {
    rootRect = getBoundingClientRect(this.root);
  } else {
    // Use <html>/<body> instead of window since scroll bars affect size.
    var html = document.documentElement;
    var body = document.body;
    rootRect = {
      top: 0,
      left: 0,
      right: html.clientWidth || body.clientWidth,
      width: html.clientWidth || body.clientWidth,
      bottom: html.clientHeight || body.clientHeight,
      height: html.clientHeight || body.clientHeight
    };
  }
  return this._expandRectByRootMargin(rootRect);
};


/**
 * Accepts a rect and expands it by the rootMargin value.
 * @param {Object} rect The rect object to expand.
 * @return {Object} The expanded rect.
 * @private
 */
IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
  var margins = this._rootMarginValues.map(function(margin, i) {
    return margin.unit == 'px' ? margin.value :
        margin.value * (i % 2 ? rect.width : rect.height) / 100;
  });
  var newRect = {
    top: rect.top - margins[0],
    right: rect.right + margins[1],
    bottom: rect.bottom + margins[2],
    left: rect.left - margins[3]
  };
  newRect.width = newRect.right - newRect.left;
  newRect.height = newRect.bottom - newRect.top;

  return newRect;
};


/**
 * Accepts an old and new entry and returns true if at least one of the
 * threshold values has been crossed.
 * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
 *    particular target element or null if no previous entry exists.
 * @param {IntersectionObserverEntry} newEntry The current entry for a
 *    particular target element.
 * @return {boolean} Returns true if a any threshold has been crossed.
 * @private
 */
IntersectionObserver.prototype._hasCrossedThreshold =
    function(oldEntry, newEntry) {

  // To make comparing easier, an entry that has a ratio of 0
  // but does not actually intersect is given a value of -1
  var oldRatio = oldEntry && oldEntry.isIntersecting ?
      oldEntry.intersectionRatio || 0 : -1;
  var newRatio = newEntry.isIntersecting ?
      newEntry.intersectionRatio || 0 : -1;

  // Ignore unchanged ratios
  if (oldRatio === newRatio) return;

  for (var i = 0; i < this.thresholds.length; i++) {
    var threshold = this.thresholds[i];

    // Return true if an entry matches a threshold or if the new ratio
    // and the old ratio are on the opposite sides of a threshold.
    if (threshold == oldRatio || threshold == newRatio ||
        threshold < oldRatio !== threshold < newRatio) {
      return true;
    }
  }
};


/**
 * Returns whether or not the root element is an element and is in the DOM.
 * @return {boolean} True if the root element is an element and is in the DOM.
 * @private
 */
IntersectionObserver.prototype._rootIsInDom = function() {
  return !this.root || containsDeep(document, this.root);
};


/**
 * Returns whether or not the target element is a child of root.
 * @param {Element} target The target element to check.
 * @return {boolean} True if the target element is a child of root.
 * @private
 */
IntersectionObserver.prototype._rootContainsTarget = function(target) {
  return containsDeep(this.root || document, target);
};


/**
 * Adds the instance to the global IntersectionObserver registry if it isn't
 * already present.
 * @private
 */
IntersectionObserver.prototype._registerInstance = function() {
  if (registry.indexOf(this) < 0) {
    registry.push(this);
  }
};


/**
 * Removes the instance from the global IntersectionObserver registry.
 * @private
 */
IntersectionObserver.prototype._unregisterInstance = function() {
  var index = registry.indexOf(this);
  if (index != -1) registry.splice(index, 1);
};


/**
 * Returns the result of the performance.now() method or null in browsers
 * that don't support the API.
 * @return {number} The elapsed time since the page was requested.
 */
function now() {
  return window.performance && performance.now && performance.now();
}


/**
 * Throttles a function and delays its executiong, so it's only called at most
 * once within a given time period.
 * @param {Function} fn The function to throttle.
 * @param {number} timeout The amount of time that must pass before the
 *     function can be called again.
 * @return {Function} The throttled function.
 */
function throttle(fn, timeout) {
  var timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(function() {
        fn();
        timer = null;
      }, timeout);
    }
  };
}


/**
 * Adds an event handler to a DOM node ensuring cross-browser compatibility.
 * @param {Node} node The DOM node to add the event handler to.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to add.
 * @param {boolean} opt_useCapture Optionally adds the even to the capture
 *     phase. Note: this only works in modern browsers.
 */
function addEvent(node, event, fn, opt_useCapture) {
  if (typeof node.addEventListener == 'function') {
    node.addEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.attachEvent == 'function') {
    node.attachEvent('on' + event, fn);
  }
}


/**
 * Removes a previously added event handler from a DOM node.
 * @param {Node} node The DOM node to remove the event handler from.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to remove.
 * @param {boolean} opt_useCapture If the event handler was added with this
 *     flag set to true, it should be set to true here in order to remove it.
 */
function removeEvent(node, event, fn, opt_useCapture) {
  if (typeof node.removeEventListener == 'function') {
    node.removeEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.detatchEvent == 'function') {
    node.detatchEvent('on' + event, fn);
  }
}


/**
 * Returns the intersection between two rect objects.
 * @param {Object} rect1 The first rect.
 * @param {Object} rect2 The second rect.
 * @return {?Object} The intersection rect or undefined if no intersection
 *     is found.
 */
function computeRectIntersection(rect1, rect2) {
  var top = Math.max(rect1.top, rect2.top);
  var bottom = Math.min(rect1.bottom, rect2.bottom);
  var left = Math.max(rect1.left, rect2.left);
  var right = Math.min(rect1.right, rect2.right);
  var width = right - left;
  var height = bottom - top;

  return (width >= 0 && height >= 0) && {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: width,
    height: height
  };
}


/**
 * Shims the native getBoundingClientRect for compatibility with older IE.
 * @param {Element} el The element whose bounding rect to get.
 * @return {Object} The (possibly shimmed) rect of the element.
 */
function getBoundingClientRect(el) {
  var rect;

  try {
    rect = el.getBoundingClientRect();
  } catch (err) {
    // Ignore Windows 7 IE11 "Unspecified error"
    // https://github.com/w3c/IntersectionObserver/pull/205
  }

  if (!rect) return getEmptyRect();

  // Older IE
  if (!(rect.width && rect.height)) {
    rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };
  }
  return rect;
}


/**
 * Returns an empty rect object. An empty rect is returned when an element
 * is not in the DOM.
 * @return {Object} The empty rect.
 */
function getEmptyRect() {
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0
  };
}

/**
 * Checks to see if a parent element contains a child elemnt (including inside
 * shadow DOM).
 * @param {Node} parent The parent element.
 * @param {Node} child The child element.
 * @return {boolean} True if the parent node contains the child node.
 */
function containsDeep(parent, child) {
  var node = child;
  while (node) {
    if (node == parent) return true;

    node = getParentNode(node);
  }
  return false;
}


/**
 * Gets the parent node of an element or its host element if the parent node
 * is a shadow root.
 * @param {Node} node The node whose parent to get.
 * @return {Node|null} The parent node or null if no parent exists.
 */
function getParentNode(node) {
  var parent = node.parentNode;

  if (parent && parent.nodeType == 11 && parent.host) {
    // If the parent is a shadow root, return the host element.
    return parent.host;
  }
  return parent;
}


// Exposes the constructors globally.
window.IntersectionObserver = IntersectionObserver;
window.IntersectionObserverEntry = IntersectionObserverEntry;

}(window, document));

},{}]},{},[11]);
