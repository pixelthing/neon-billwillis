/*

        PAGE LOCKING/MASKING SCRIPT
        iOS in particular is tricky to use with modals, because locking the page scrolling with any CSS only methods causes the page to jump to the top. This gets around that problem.

*/
const helperPageLock = function(app) {
    "use strict";

    let   pageLockOffset = 0;
    let   iosWidth = null;
    let   iosMarginTop = null;
    let   iosPosition = null;
    let   iosOverflowY = null;
    const $html    = document.querySelector('html');
    let   $outer = document.querySelector('body');
    let   $inner = document.querySelector('.Wrap') || document.querySelector('.view-section');
    let   $bin = [];

    // lock page scrolling
    const lockPage = function(offset,modifier) { // passing offset (even if it's the top of page "0") saves having to do a scrolTop measurement, which depending on the device the moment could take 100ms or much more.

        //console.warn('LOCK!');
            
        if (!offset) {
            if (typeof document.documentElement === 'undefined' || typeof document.documentElement.scrollTop === 'undefined') {
                pageLockOffset = document.body.scrollTop;
            } else {
                pageLockOffset = Math.max( document.documentElement.scrollTop, document.body.scrollTop );
            }
        } else if (typeof pageLockOffset != 'number') {
            pageLockOffset = 0;
        } else {
            pageLockOffset = offset;
        }
        iosMarginTop = $inner.style.marginTop;
        iosWidth = $inner.style.width;
        iosPosition = $inner.style.position;
        iosOverflowY = $inner.style.overflowY;
        $inner.style.position = 'relative';
        $inner.style.width = '100%';
        $inner.style.overflowY = 'hidden';
        if (pageLockOffset !== 0) {
            $inner.style.marginTop = '-' + pageLockOffset + 'px';
        }
        
        $outer.className += ' page-lock--locked' + (modifier ? '--' + modifier : '');

        //console.warn('LOCKED!');

    };

    // unlock (and unmask - if it is masked) page scrolling
    const unLockPage = function() {

        //console.log('UNLOCK!');
        
        if (new RegExp('page-lock--locked', 'gi').test($outer.className)) {
            $outer.className = $outer.className.replace(new RegExp('(^|\\b)' + '(page-lock--locked--xxs|page-lock--locked)' + '(\\b|$)', 'gi'), ' ').replace(/\s{1,99}/,' ');
            $inner.style.position = iosPosition;
            $inner.style.width = iosWidth;
            $inner.style.overflowY = iosOverflowY;
            $inner.style.marginTop = iosMarginTop;
            try {
                document.body.scrollTop = pageLockOffset;
            } catch(e) {}
            try {
                document.documentElement.scrollTop = pageLockOffset;
            } catch(e) {}
            pageLockOffset = 0;
        }

        //console.log('UNLOCKED!');

    };

    return {
        on: lockPage,
        off: unLockPage
    };

};

export default helperPageLock;