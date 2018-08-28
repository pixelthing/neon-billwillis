import debounce        from 'lodash.debounce';

/**
 * @module
 * the control the behaviours of a single level of navigation
 */

const selector = '[data-js-hero-full]';
const heroFull = function(el, app) {

    const $el = $(el);
    let   height = 0;
    let   viewportWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();
    let   viewportWidthPrev = viewportWidth;
    let   viewportHeight = window.innerHeight || document.documentElement.clientHeight || $(window).height();
    let   viewportHeightPrev = viewportHeight;
    
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
        $el.addClass('HeroFull--ready');
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
        $('[data-js-hero-full-more]').click(function(ev) {
            ev.preventDefault();
            $("html, body").animate({ scrollTop: el.offsetHeight }, 500);
        });
    };

    // things need to be re-positioned when the window is resized
    const onResize = function() {

        let   timer = false;
        
        let   scrolling = false;
        $(window).scroll(function onScroll (ev) {
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
                $el.addClass('HeroFull--ready');
            }
            viewportWidthPrev = viewportWidth;
            viewportHeightPrev = viewportHeight;

        };

        // throttle resize events
        $(window).resize(function onResizeUnThrottled (ev) {
            if (!scrolling) {
                $el.removeClass('HeroFull--ready');
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
