import raf             from 'raf';
import intersectionObs from 'intersection-observer';

/**
 * @module
 * our own take on lazyloading, based in intersection observer (which is polyfilled in this project). Intersection observer is the way forward - it's much, much lighter on the browser CPU load.
 * Uses exactly the same markup as lazysizes https://afarkas.github.io/lazysizes/index.html to allow easy upgrade/delete/sidegrade (delete as applicable)
 * For speed (this is a a script running on the main thread during scroll), this is all vanilla JS, no jQuery.
 */
 
const selector = '.lazyload';
const helperLazyload = function(el, app) {

    const wrap = el.parentNode;
    let status = false; // has this element been discovered yet?
    const options = {
        rootMargin: '50px',
        threshold: 0.1
    };
    let   imgType = false;
    const imgAttr = {};
    let   imgSources = false;
    let   duration = 800;
    let   strut = false;
    let   srcSetSupport = false;
    
    // on page load
    const init = function() {
        // we need to calculate how many images need strutting and how many have been completed.
        if (!app.lazyLoad) {
            app.lazyLoad = {};
            app.lazyLoad.strutsTotal = document.querySelectorAll('.lazyload-strut').length;
            app.lazyLoad.strutsReady = 0;
        }
        // delay costly  processes a frame to allow other more important elements painted first. !!DOUBLE RAF!! https://medium.com/@paul_irish/requestanimationframe-scheduling-for-nerds-9c57f7438ef4
        raf(function tick1() {
            raf(function tick2() {
                collectAttr();
                intersectionInit();
            });
        });
        // check to see that browse supports srcset
        const img = document.createElement('img');
        srcSetSupport = ('sizes' in img);
    };

    // do as much of the DOM lookup and store it in memory before we start using the main thread for scrolling.
    const collectAttr = function() {
        imgType = el.tagName;
        // picture element
        if (imgType === 'PICTURE') {
            imgSources = el.getElementsByTagName("SOURCE");
            for (let i=0; i<imgSources.length; i++) {
                imgAttr.sources.push(imgSources[i].getAttribute('data-srcset'));
            }
            const imgTag = el.getElementsByTagName("IMG");
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
    const buildStrut = function() {

        // only for IMG and PICTURE elements
        if (['IMG','PICTURE'].indexOf(imgType) < 0) {
            return;
        }
        // only if we have a width and height to base the dimensions on.
        if (!imgAttr.width && !imgAttr.height) {
            return;
        }

        // all go
        strut = true;

        // prop-up the wrapper to emulate the size of the image
        const percentage =  parseInt(imgAttr.height)/parseInt(imgAttr.width) * 100;
        const percentageDim = percentage + '%';
        wrap.className += ' lazyload-strut--ready';
        wrap.style.paddingTop = percentageDim;
        app.lazyLoad.strutsReady++;
        // is this the last strut on the page?
        if (app.lazyLoad.strutsReady === app.lazyLoad.strutsTotal ) {
            app.trigger('lazyload-struts-ready');
        }
        
    };
    
    // set-up the intersection observer
    const intersectionInit = function() {
        const observer = new IntersectionObserver(intersectionObserved, options);
        observer.observe(el);
    };
    
    // intersection event handler
    const intersectionObserved = function(entries, observer) { 
        entries.forEach(entry => {
            // found an unloaded image!
            if (!status && entry.intersectionRatio > options.threshold) {
                loadStart();
                status = true;
            }
        });
    };

    // load the url
    const loadStart = function() {
        // prep the event after the image has loaded
        loadFile();
        // picture element
        if (imgType === 'PICTURE') {
            for (let i=0; i<imgSources.length; i++) {
                imgSources[i].srcset = imgAttr.sources[i];
            }
        // img element
        } else if (imgType === 'IMG')  {
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
        let newEvent = null;
        newEvent = new CustomEvent('imageLoaded',{detail: {'test':'test1'}});
        el.dispatchEvent(newEvent);
        // we've swapped the url to the image, add a class to show we're now downloading the image, even if it hasn't arrived in this frame
        el.className += ' lazyloading';
    };

    // after the image file has loaded, reveal it.
    const loadFile = function() {
        const loadFileLoaded = function() {
            // apparently a RAF frame isn't enough for Chrome to not contatinate styles, resulting in no fade. So back to setTimeout...
            setTimeout(function loadFileLoadedRAF() {
                el.className = el.className.replace('lazyloading','lazyloaded');
                // when the fade in is complete, remove the class
                setTimeout(function loadFileLoadedFadeEnd () {
                    el.className = el.className.replace(new RegExp('(^|\\b)' + 'lazyload' + '(\\b|$)', 'gi'), '');
                }, duration);
            },50);
        };
        // wait for the onload event
        el.onload = loadFileLoaded();
    };

    return {
        init: init()
    };
};

helperLazyload.selector = selector;

export default helperLazyload;
