import raf                  from 'raf';
import helperA11y           from 'shared/mixins/helper-a11y';
import helperUtilities      from 'shared/mixins/helper-utilities';

/**
 * @module
 * 
 */
 
const selector = '[data-js-toggle]';
const toggleContent = function(el, app) {

    const a11yHelper                = helperA11y(app);
    const utilities 		        = helperUtilities(app);
    
    let   acceptingClicks           = false;      // true during the toggling transition, when no further action can be started
    let   status                    = false;      // current status of toggle: TRUE: content hidden (opposite visible) : FALSE: content visible (opposite hidden)
    let   initStatus                = false;      // the initial state of the toggle (TRUE: content hidden (opposite visible) : FALSE: content visible (opposite hidden))
    let   keyboardDriven            = false;      // lets us know if the opening action was keyboard or mouseclick/tap driven (helps with determining what UI focus and hints to use)

    const $window                   = $(window);
    const content                   = el;
    const $content                  = $(content);      // the $ obj of primary content content container that will be toggled off and one
    const $opposite                 = $($content.attr('data-toggle-opposite'));         // the optional $ obj of any secondary container that needs to be toggled in the opposite direction at the same time.
    const $buttons                  = $($content.attr('data-toggle-button'));           // the $ obj of any buttons/inputs that will carry out the toggling
    const requiredVal               = $content.attr('data-toggle-button-value');        // if the elements that trigger the toggling are an input/select, what is the required value that triggers the toggle?

    let   contentHeight             = 2000;       // default content height
    let   contentTop                = 0;          // default content top
    let   oppositeHeight            = 2000;       // default opposite content height
    let   oppositeTop               = 0;          // default opposite content top
    let   buttonTop                 = 0;          // button top position
    let   duration                  = 300;        // transition duration
    
    /* classes */


    const classContentReady         = 'Toggle-Content--ready';
    const classContentStateVisible  = 'Toggle-Content--visible';
    const classContentStateHidden   = 'Toggle-Content--hidden';
    const classContentSection       = 'Toggle-Content--section';
    const classContentHeight        = 'Toggle-Content--height';
    const classContentAnimate       = 'Toggle-Content--animate';
        
    const classButtonReady          = 'Toggle-Btn--ready';
    const classButtonStateUnToggled = 'Toggle-Btn--off';
    const classButtonStateToggled   = 'Toggle-Btn--on';
        
    const classOppositeReady        = 'Toggle-Opposite--ready';
    const classOppositeStateHidden  = 'Toggle-Opposite--hidden';
    const classOppositeStateVisible = 'Toggle-Opposite--visible';
    const classOppositeSection      = 'Toggle-Opposite--section';
    const classOppositeHeight       = 'Toggle-Opposite--height';
    const classOppositeAnimate      = 'Toggle-Opposite--animate';
    
    const init = function() {
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
        raf(function tick1() {
            raf(function tick2() {
                app.trigger('toggleReady',[$content]);
            });
        });
        setTimeout(function() {
            measureAfterInit();
        },800);
        
    };

    // measure content before it is set and THEN set the css to create the initial state
    const measureAndSet = function() {
        // content height
        const contentRect = content.getBoundingClientRect();
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
    const measureAfterInit = function() {
        // button initial positions (only complicated by potentially being multiple buttons to the same content)
        $.each($buttons,function(index, button) {
            const $button = $(button);
            const buttonRect = button.getBoundingClientRect();
            $button.data('toggleTop',buttonRect.top + $window.scrollTop());
        });
    };
    
    // on initialisation, get the initial state of this toggle
    const getInitState = function() {
        // what is the default initial state
        let output = ( $content.attr('data-toggle-init-closed') !== undefined ? true : false );
        // override it if we're basing the staus on a radio/checkbox (could be set by form being prefilled by JS)
        if (typeof requiredVal !== 'undefined') {
            const buttonVal = $buttons.filter(':checked').val();
            output = ( requiredVal.localeCompare(buttonVal) === 0 ? false : true );
        // otherwise, override it by reading the class of the content
        } else if ($content.hasClass(classContentStateVisible)) {
            output = ( $content.hasClass(classContentStateVisible) ? false : true );
        }
        return output;
    };
    
    // on inirtialisation, set the pieces up as it should be.
    const initState = function() {
        // set-up the initial state (before animations are set)
        toggleAll(status);
        // only add the animation classes after the state is set-up (stops initial animate-in)
        raf(function tick1() {
            raf(function tick2() {
                $content.addClass(classContentReady).addClass(classContentAnimate);
                $opposite.addClass(classOppositeReady).addClass(classOppositeAnimate);
                $buttons.addClass(classButtonReady);
            });
        });
    };
    
    // register events
    const registerEvents = function() {
        let action = 'click';
        if ($buttons.is('input[type="checkbox"]') || $buttons.is('input[type="radio"]')) {
            action = 'change';
        }
        $buttons.on(action, function(ev) {
            const $button = $(this);
            // if the button is a checkbox/radio and requires a specific value
            if (typeof requiredVal !== 'undefined') {
                const buttonVal = $buttons.filter(':checked').val();
                status = ( requiredVal.localeCompare(buttonVal) === 0 ? false : true );
            // if no value is required, toggle the status on each click
            } else {
                status = !status;
            }
            keyboardDriven = utilities.keyboardClick(ev);
            checkNeedForScrollThenToggle(status,ev,$button);
        });
        // trigger event from outside.
        $content.on('toggleAll',function(){
            toggleAll();
        });
    };

    const checkNeedForScrollThenToggle = function(changeTo, ev, $button) {
        const buttonTop = $button.data('toggleTop'); // what is the "original" (eg, closed) position of this button?
        const scrollTop = $window.scrollTop();
        const outOfViewPort = (buttonTop < scrollTop ? true : false );
        //console.log(buttonTop, scrollTop, outOfViewPort);
        if (outOfViewPort) {
            setTimeout(function() {
                toggleAll(status,ev,$button);
            }, duration + 50);
            scrollToStart(buttonTop, scrollTop, $button);
        } else {
            raf(function tick1() {
                raf(function tick2() {
                    toggleAll(status, ev, $button);
                });
            });
        }
    };

    const scrollToStart = function(buttonTop, scrollTop, $button) {
        // Is there a sticky menu that is in the sticky point? This will effect scrolling point.
        const stickyActive = app.navStickyStatus;
        const newTop = buttonTop - (stickyActive ? 70 : 0) - 100 + 'px';
        $content.css('transition-timing-function','linear');
        // scroll for a period of time equal to the distance in px needed to scroll (so a small amount doesn't look horribly slow), up to a maximum amount of time (800ms)
        $('html,body').animate({ scrollTop: newTop }, {'duration': duration, 'easing': 'swing' } ); // same duration as the max-height transition
    };
    
    // trigger the toggle transition
    const toggleAll = function(changeTo, ev, $button) {
        // if no state decided, toggle to the oppisite of the existing status
        if (typeof changeTo === 'undefined') {
            changeTo = !status;
        }
        // do it!
        toggleContent(changeTo, ev);
        toggleOpposite(changeTo, ev);
        toggleButton(changeTo, ev, $button);
        // notify other methods that the toggle has finished
        setTimeout(function() {
            app.trigger('toggleToggled',[$content,changeTo]);
        },duration);
        // update internal status
        status = changeTo;
    };
    
    // toggle the content area
    const toggleContent = function(state,ev) {
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
    const toggleButton = function(state, ev, $button) {
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
    const toggleOpposite = function(state,ev) {
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

export default toggleContent;
