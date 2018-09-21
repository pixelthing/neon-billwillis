import debounce        from 'lodash.debounce';

/**
 * @module
 * the control the behaviours of a single level of navigation
 */

const selector = '[data-js-hero-full]';
const heroFull = function(el, app) {

    let   height = 0;
    let   viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    let   viewportWidthPrev = viewportWidth;
    let   viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    let   viewportHeightPrev = viewportHeight;
    const intersectionOptions = {threshold: 0.2};
    
    const init = function() {
        // do the initial measurements of all widths
        measure();
        // do the initial measurements of all widths
        setHeight();
        // set up the resize event
        onResize();
        // click for more button
        moreButton();
        // set as ready
        el.classList.add('HeroFull--ready');
        // pause the video if it goes off screen
        intersectionInit();
    };

    // set-up the intersection observer
    const intersectionInit = function() {
        const observer = new IntersectionObserver(intersectionObserved, intersectionOptions);
        observer.observe(el);
    };
    
    // intersection event handler
    const intersectionObserved = function(entries, observer) { 
        const $videoEl = el.querySelector( '[data-js-hero-video]' );
        entries.forEach(entry => {
            // when the video if off screen, pause it
            if ( $videoEl && entry.intersectionRatio < intersectionOptions.threshold ) {
                $videoEl.pause();
            // if it is paused and returns to onscreen, play it!
            } else {
                if ( $videoEl && $videoEl.paused ) {
                    $videoEl.play();
                }
            }
        });
    };

    // measure the widths of all core components
    const measure = function() {

        // get on with the measuring
        height = el.offsetHeight;
    };
    
    // measure the offset of the first nav link (needs to be done after the priority plus shuffle is complete)
    const setHeight = function() {
        el.style.height = height + 'px';
    };

    const moreButton = function() {
        document.querySelector('[data-js-hero-full-more]').addEventListener('click',function(ev) {
            ev.preventDefault();

            const targetSelector = this.getAttribute('data-hero-full-more-target');
            const target = document.querySelector(targetSelector);
            const targetPos = target.offsetTop;

            function scrollTo( endPoint, scrollDuration ) {
                let   cosParameter = ( endPoint - window.scrollY ) / 2;
                let   scrollCount = 0;
                let   oldTimestamp = performance.now();
                function step (newTimestamp) {
                    scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));
                    if (scrollCount >= Math.PI) window.scrollTo(0, endPoint );
                    if (window.scrollY === endPoint) return;
                    window.scrollTo(0, Math.round(cosParameter - cosParameter * Math.cos(scrollCount)));
                    oldTimestamp = newTimestamp;
                    window.requestAnimationFrame( step );
                }
                window.requestAnimationFrame( step );
            }
            scrollTo( targetPos, 500 );

        });
    };

    // things need to be re-positioned when the window is resized
    const onResize = function() {

        let   timer = false;
        
        let   scrolling = false;
        window.addEventListener("scroll", function onScroll (ev) {
            scrolling = true;
        });
        
        const onResizeThrottled = function(ev) {
            // Don't trigger resize on vertical resize (mobile OS' do this all the time just on scroll). 
            // Note that we try and do every kind of "soft" measurement before we attempt to recalc styles (which is costly in FPS)
            viewportWidth = ev.target.innerWidth || window.innerWidth || document.documentElement.clientWidth || $(window).width();
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || $(window).height();
            if (viewportWidth != viewportWidthPrev || ( viewportHeight != viewportHeightPrev && !scrolling))  {
                el.setAttribute('style','');
                measure();
                setHeight();
                el.classList.add('HeroFull--ready');
            }
            viewportWidthPrev = viewportWidth;
            viewportHeightPrev = viewportHeight;

        };

        // throttle resize events
        window.addEventListener("resize", function onResizeUnThrottled (ev) {
            if (!scrolling) {
                el.classList.remove('HeroFull--ready');
            }
            debounce(function() {
                onResizeThrottled(ev);
            }, 600)();
        });

    };

    return {
        init: init()
    };
};

heroFull.selector = selector;

export default heroFull;
