import debounce        from 'lodash.debounce';
import Promise         from 'promise-polyfill'; 

/**
 * @module
 * simple polyfill to swap the currentSrc of an object-fit'ed img to be the background of it's container.
 */
 
const selector = '[data-js-video]';
const videoFrame = function(el, app) {

    const $el = el;
    const $poster = $el.querySelector('[data-js-video-poster]');
    const $iframe = $el.querySelector('[data-js-video-iframe]');
    const $play = $el.querySelector('[data-js-video-play]');
    const $allyOpen = $el.querySelector('[data-js-video-ally-open]');
    const $allyClose = $el.querySelector('[data-js-video-ally-close]');
    let   status = false;
    const duration = 300;
    let   playWidth = 0;
    let   playMargin = 0;
    let   posterWidth = 0;
    let   posterHeight = 0;
    let   viewportWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();
    let   viewportWidthPrev = viewportWidth;
    
    const init = function() {
        measure();
        setButtonTransition();
        registerEvents();
        // set up the resize event
        onResize();
        $iframe.setAttribute('aria-hidden',true);
    };

    const measure = function() {
        playWidth = $play.offsetWidth;
        var computedStyle = window.getComputedStyle($play);
        playMargin = parseInt(computedStyle.marginRight);
        posterWidth = $poster.offsetWidth;
        posterHeight = $poster.offsetHeight;
    };

    const setButtonTransition = function() {
        const playEndWidth = 40;
        const transformScale = playEndWidth / playWidth;
        const transformX = ( posterWidth - playEndWidth ) - ( (posterWidth/2) - (playWidth/2) ) - playEndWidth - ( window.innerWidth < 600 ? -2 : 5 ) ;
        const transformY = ( posterHeight - playEndWidth ) - ( (posterHeight/2) - (playWidth/2) ) - playEndWidth + 60;
        const transform = 'translateX(' + transformX + 'px) translateY(-' + transformY + 'px) scale(' + transformScale + ') rotate(90deg)';
        // store the transform
        $play.setAttribute('data-js-transform',transform);
    };

    const registerEvents = function() {
        $poster.addEventListener('click', playStop);
        $play.addEventListener('click', playStop);
    };

    const playStop = function(ev) {
        ev.preventDefault();
        if (!status) {
            play();
        } else {
            stop();
        }
    };

    const play = function() {
        $iframe.setAttribute('aria-hidden',false);
        $poster.classList.add('Video-Poster--active');
        $poster.setAttribute('tabindex','-1');
        $iframe.classList.add('Video-Iframe--active');
        const src = $poster.getAttribute('data-js-video-src');
        $iframe.setAttribute('src', src);
        // add the classes that control the transition
        $play.classList.add('Video-Play--play-stop');
        // set transition going
        playToStop();
        status = true;
        // remove the transition classes once done
        setTimeout(function playTimer () {
            $play.classList.remove('Video-Play--play-stop');
            $play.setAttribute('tabindex','0');
            $allyOpen.style.display = 'none';
            $allyClose.style.display = 'block';
        },duration);
    };

    const playToStop = function(instant) {
        const styleCore = 'transform: ' + $play.getAttribute('data-js-transform');
        $play.classList.add('Video-Play--active');
        $play.setAttribute('style', styleCore);
        $allyOpen.style.display = 'block';
        $allyClose.style.display = 'none';
        $iframe.setAttribute('aria-hidden',true);
    };
    
    const stop = function() {
        $poster.classList.remove('Video-Poster--active');
        $poster.setAttribute('tabindex','0');
        $iframe.classList.remove('Video-Iframe--active');
        $play.classList.add('Video-Play--play-stop');
        $play.classList.remove('Video-Play--active');
        $play.setAttribute('style','');
        $play.setAttribute('tabindex','-1');
        // when the transition is complete, remove the iFrame src.
        setTimeout(function stopTimer () {
            $iframe.src = '';
            status = false;
            // remove the transition classes once done
            $play.classList.remove('Video-Play--play-stop');
        },duration);
    };

    const onResizeMeasurePlay = function() {
        return new Promise(function measuringPlay1Promise (resolve, reject) {  
            $play.setAttribute('style','transition:all 0ms');
            measure();
            if ($play.classList.contains('Video-Play--active')) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };

    // things need to be re-positioned when the window is resized
    const onResize = function() {
        
        let   timer = false;
        
        const onResizeThrottled = function() {
            onResizeMeasurePlay().then(function(wasActive) {
                setButtonTransition();
                // if the play button was active, reset it after the measurements
                if (wasActive) {
                    playToStop();
                }
                $el.classList.remove('Video--resizing');
            });
        };

        // throttle resize events
        window.addEventListener("resize", function onResizeUnThrottled (ev) {
            // Don't trigger resize on vertical resize (mobile OS' do this all the time just on scroll). 
            // Note that we try and do every kind of "soft" measurement before we attempt to recalc styles (which is costly in FPS)
            viewportWidth = ev.target.innerWidth || window.innerWidth || document.documentElement.clientWidth || $(window).width();
            if (viewportWidth != viewportWidthPrev) {
                $el.classList.add('Video--resizing');
                debounce(onResizeThrottled, 500, { 'leading': false })();
            }
            viewportWidthPrev = viewportWidth;
        });

    };

    return {
        init: init()
    };
};

videoFrame.selector = selector;

export default videoFrame;
