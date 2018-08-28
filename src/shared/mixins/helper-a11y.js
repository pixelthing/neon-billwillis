/**
 * @method
 */
const helperA11y = function() {

    // on opening dialogs/closing, popups, etc, it's best to focus on a particular element so the tab/screenreader navigation options are clear
    const reFocus = function(ev,$firstFocusable) {
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
        },200);
    };

    // hide this element and all enclosed tab accessible elements from keyboard/screenreader navigation
    const hide = function($el) {
        $el.setAttribute('aria-hidden','true');
        $el.find('a,button,input,textarea,select,label[tabindex=0]').attr('tabindex',-1).attr('aria-hidden','true');
    };
    
    // reveal this element and all enclosed tab accessible elements to keyboard/screenreader navigation
    const show = function($el) {
        $el.setAttribute('aria-hidden','false');
        $el.find('a,button,input,textarea,select,label[tabindex=-1]').attr('tabindex',0).attr('aria-hidden','false');
    };

    return {
        reFocus,
        hide,
        show
    };
};

export default helperA11y;
