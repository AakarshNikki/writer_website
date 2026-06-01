/*
 * Nick of All Trades - Author Landing Page
 * Clean Horizontal Wheel & Mobile Touch Capture with Book Layout Scroll Context
 */

$(document).ready(function () {
    let scrollPosition = 0;
    let touchStartX = 0;
    let initialScrollPosition = 0;

    $(".story-select-btn").on("click", function(e) {
        e.preventDefault();
        const targetStoryToken = $(this).attr("data-story");

        $(".story-instance-data").hide();
        scrollPosition = 0;
        
        const activeSection = document.querySelector(`#${targetStoryToken}-data .nick-story-section`);
        if (activeSection) {
            gsap.set(activeSection, { x: 0 });
        }

        $(`#${targetStoryToken}-data`).show();
        
        gsap.fromTo("#story-reader", 
            { opacity: 0, display: "none" },
            { opacity: 1, display: "flex", duration: 0.4 }
        );

        bindHorizontalNavigation(targetStoryToken);
    });

    function bindHorizontalNavigation(storyId) {
        const container = document.querySelector(".nick-story-scroller-container");
        const track = document.querySelector(`#${storyId}-data .nick-story-section`);
        
        if (!container || !track) return;

        $("#story-reader").off("wheel touchstart touchmove");

        // 1. DESKTOP/TRACKPAD WHEEL BINDING
        $("#story-reader").on("wheel", function(e) {
            const activeTextBox = e.target.closest('.story-full-text-box');
            
            // If the cursor is over a text box, let vertical scrolling happen natively first
            if (activeTextBox) {
                const isScrollingDown = e.originalEvent.deltaY > 0;
                const isAtBottom = activeTextBox.scrollHeight - activeTextBox.scrollTop <= activeTextBox.clientHeight + 2;
                const isAtTop = activeTextBox.scrollTop === 0;

                // Block slider transition unless they push past top/bottom bounds
                if (!isScrollingDown && !isAtTop) return; 
                if (isScrollingDown && !isAtBottom) return; 
            }

            e.preventDefault();
            const maxScrollDelta = track.scrollWidth - container.clientWidth;
            const delta = e.originalEvent.deltaY || e.originalEvent.detail || -e.originalEvent.wheelDelta;
            
            scrollPosition += delta * 2.0;
            if (scrollPosition < 0) scrollPosition = 0;
            if (scrollPosition > maxScrollDelta) scrollPosition = maxScrollDelta;

            gsap.to(track, { x: -scrollPosition, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        });

        // 2. MOBILE TOUCH BINDING
        $("#story-reader").on("touchstart", function(e) {
            touchStartX = e.originalEvent.touches[0].clientX;
            initialScrollPosition = scrollPosition;
        });

        $("#story-reader").on("touchmove", function(e) {
            const activeTextBox = e.target.closest('.story-full-text-box');
            
            // Let native touch drag scroll text up and down on phones smoothly
            if (activeTextBox) {
                const isAtBottom = activeTextBox.scrollHeight - activeTextBox.scrollTop <= activeTextBox.clientHeight + 2;
                const isAtTop = activeTextBox.scrollTop === 0;
                
                if (activeTextBox.scrollHeight > activeTextBox.clientHeight) {
                    // Stop container swipe if we are explicitly digesting layout content vertically
                    if (Math.abs(e.originalEvent.touches[0].clientY - touchStartX) > Math.abs(touchStartX - e.originalEvent.touches[0].clientX)) {
                         return; 
                    }
                }
            }

            e.preventDefault();
            const maxScrollDelta = track.scrollWidth - container.clientWidth;
            const currentTouchX = e.originalEvent.touches[0].clientX;
            const touchDeltaX = touchStartX - currentTouchX;
            
            scrollPosition = initialScrollPosition + (touchDeltaX * 1.5);
            if (scrollPosition < 0) scrollPosition = 0;
            if (scrollPosition > maxScrollDelta) scrollPosition = maxScrollDelta;

            gsap.to(track, { x: -scrollPosition, duration: 0.2, ease: "power1.out", overwrite: "auto" });
        });
    }

    $("#close-story-reader").on("click", function() {
        $("#story-reader").off("wheel touchstart touchmove");
        gsap.to("#story-reader", { opacity: 0, display: "none", duration: 0.3 });
    });
});