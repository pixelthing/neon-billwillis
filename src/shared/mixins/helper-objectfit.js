/**
 * @module
 * simple polyfill to swap the currentSrc of an object-fit'ed img to be the background of it's container.
 * For speed (this can be very much a render blocking  - or at least a flash of unstyled content - script), this is all vanilla JS, no jQuery.
 */

const selector = '[data-js-poly-object-fit]';
const helperObjectFit = function(el, app) {

    const wrap = el;
    let   image = el.children[0];

    const init = function() {

        // assumes a IMG or IMG/SRCSET by default, but needs a tweak if it's a PICTURE element
        if (image.tagName === 'PICTURE') {
            image = el.children[0].getElementsByTagName("IMG")[0];
            console.log("image", image);
        // if it's not an PICTURE or an IMG, exit here.
        } else if (image.tagName !== 'IMG') {
            return;
        }

        // test for object position (iOS8 responds to object-fit even though it doesn't properly support it, so easier to test for object-position, which is a more definite answer)
        if('objectPosition' in document.documentElement.style === false) {

            // hasClass helper (non jQuery IE8+)
            const hasClass = function(className) {
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
    const waitForLoad = function() {

        // when the event is triggered (the image loads), run this
        const waitForLoadTriggered = function() {
            // remove the event listender now it's triggered
            image.removeEventListener('imageLoaded', waitForLoadTriggered);
            // run the polyfill
            polyfill();
        };
        // wait for the
        image.addEventListener('imageLoaded', waitForLoadTriggered);

    };

    const polyfill = function() {
        const imgUrl = ( image.currentSrc !== undefined ? image.currentSrc : image.src );
        if (imgUrl !== undefined) {
            wrap.style.backgroundImage = 'url(' + imgUrl + ')';
            image.className += ' ObjectFit--hidden';
            setTimeout(function() {
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

export default helperObjectFit;
